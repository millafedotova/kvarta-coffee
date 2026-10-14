import { expect, it } from "vitest";
import { POST } from "../src/app/api/lead/route";

const input = {
  name: "Test",
  phone: "+375291234567",
  interest: "question",
  productId: null,
  comment: "",
  attribution: null,
  submissionUrl: "http://127.0.0.1:3000/",
};

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
  expect((await response.json()).errors.phone).toContain("белорусский");
});

it("rejects oversized bodies without acknowledging a lead", async () => {
  const request = new Request("http://localhost:3000/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, comment: "a".repeat(17000) }),
  });
  expect((await POST(request)).status).toBe(413);
});
