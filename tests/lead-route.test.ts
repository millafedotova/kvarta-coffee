import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/lead/route";

const storage = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("../src/lib/db", () => ({ getPool: () => ({}) }));
vi.mock("../src/lib/lead-repository", () => ({
  createLeadRepository: () => storage.save,
}));
beforeEach(() => {
  storage.save
    .mockReset()
    .mockRejectedValue(new Error("Synthetic database failure"));
  vi.stubEnv(
    "LEAD_ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const input = {
  name: "Test",
  phone: "+375291234567",
  interest: "question",
  productId: null,
  comment: "",
  attribution: null,
  submissionUrl: "http://127.0.0.1:3000/",
};

function validRequest() {
  return new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(input),
  });
}

it("accepts a development submission from its actual alternate loopback port", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL", "");
  storage.save.mockResolvedValueOnce("created");
  const response = await POST(
    new Request("http://127.0.0.1:3002/api/lead", {
      method: "POST",
      headers: {
        Origin: "http://127.0.0.1:3002",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...input, phone: "+375 34 777-00-19" }),
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ status: "created" });
  expect(storage.save).toHaveBeenCalledWith(
    expect.objectContaining({ phone: "+375347770019" }),
  );
});

it.each(["+375 29 123-45-67", "+375 29 123 45 67", "375291234567"])(
  "accepts %s at the API boundary and stores its canonical number",
  async (phone) => {
    storage.save.mockResolvedValueOnce("created");
    const response = await POST(
      new Request("http://localhost:3000/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, phone }),
      }),
    );
    expect(response.status).toBe(201);
    expect(storage.save).toHaveBeenCalledWith(
      expect.objectContaining({ phone: "+375291234567" }),
    );
  },
);

it("maps committed and duplicate results to the exact acknowledgement contract", async () => {
  storage.save
    .mockResolvedValueOnce("created")
    .mockResolvedValueOnce("duplicate");
  const first = await POST(validRequest());
  expect(first.status).toBe(201);
  expect(await first.json()).toEqual({ status: "created" });
  const second = await POST(validRequest());
  expect(second.status).toBe(200);
  expect(await second.json()).toEqual({ status: "duplicate" });
  expect(second.headers.get("cache-control")).toBe("no-store");
});

it("keeps persistence failures distinct from malformed JSON", async () => {
  expect((await POST(validRequest())).status).toBe(503);
  storage.save.mockClear();
  const malformed = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  expect((await POST(malformed)).status).toBe(400);
  expect(storage.save).not.toHaveBeenCalled();
});

it("does not report a deployed configuration failure as a field error", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("LEAD_ALLOWED_ORIGINS", "");
  expect((await POST(validRequest())).status).toBe(503);
  expect(storage.save).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});

it("rejects a lookalike JSON media type before storage", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "text/application/json-invalid" },
    body: JSON.stringify(input),
  });
  expect((await POST(request)).status).toBe(400);
  expect(storage.save).not.toHaveBeenCalled();
});

it("rejects an unfinished body at its deadline even if its received prefix is valid JSON", async () => {
  vi.useFakeTimers();
  try {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(input)));
      },
    });
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stream,
      duplex: "half",
    };
    const pending = POST(
      new Request("http://localhost:3000/api/lead", options),
    );
    await vi.advanceTimersByTimeAsync(5001);
    expect((await pending).status).toBe(400);
    expect(storage.save).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

it("accepts a legitimate preview origin even when the framework uses an internal hostname", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "127.0.0.1:3000",
      Origin: "http://127.0.0.1:3000",
    },
    body: JSON.stringify(input),
  });
  const response = await POST(request);
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ status: "unavailable" });
});

it("rejects an unrelated browser origin", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "localhost:3000",
      Origin: "https://example.com",
    },
    body: JSON.stringify(input),
  });
  expect((await POST(request)).status).toBe(400);
});

it("returns a phone field error before reaching the unavailable persistence boundary", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, phone: "+7 999 123 45 67" }),
  });
  const response = await POST(request);
  expect(response.status).toBe(400);
  const body = await response.json();
  expect(body.errors.phone).toContain("+375");
  expect(body.errorCodes.phone).toBe("phoneInvalid");
});

it("rejects oversized bodies without acknowledging a lead", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, comment: "a".repeat(17000) }),
  });
  expect((await POST(request)).status).toBe(413);
});
