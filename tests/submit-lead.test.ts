import { describe, expect, it, vi } from "vitest";
import { submitLead } from "../src/lib/submit-lead";
import type { LeadInput } from "../src/lib/lead-validation";

const input: LeadInput = {
  name: "Тест",
  phone: "+375291234567",
  interest: "question",
  productId: null,
  comment: "",
  attribution: null,
  submissionUrl: "http://localhost:3000/",
};

describe("submission acknowledgements", () => {
  it("accepts only the expected durable-created or duplicate contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ status: "created" }, { status: 201 }),
        )
        .mockResolvedValueOnce(
          Response.json({ status: "duplicate" }, { status: 200 }),
        ),
    );
    expect(await submitLead(input)).toEqual({ status: "created" });
    expect(await submitLead(input)).toEqual({ status: "duplicate" });
  });
  it("does not present arbitrary successful HTTP responses as saved leads", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ status: "created" }, { status: 200 }),
        )
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 })),
    );
    expect(await submitLead(input)).toEqual({ status: "network_error" });
    expect(await submitLead(input)).toEqual({ status: "network_error" });
  });
  it("distinguishes unavailable persistence and an uncertain network outcome", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ status: "unavailable" }, { status: 503 }),
        )
        .mockRejectedValueOnce(new Error("Disconnected")),
    );
    expect(await submitLead(input)).toEqual({ status: "unavailable" });
    expect(await submitLead(input)).toEqual({ status: "network_error" });
  });
});
