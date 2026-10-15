import { describe, expect, it, vi } from "vitest";
import { captureAttribution, sanitizePageUrl } from "../src/lib/attribution";
import { leadSchema } from "../src/lib/lead-validation";
import { attributionSchema } from "../src/lib/page-context";

describe("campaign attribution", () => {
  it("drops invalid optional campaign values while preserving valid fields", () => {
    const result = attributionSchema.parse({
      version: 1,
      enteredAt: "2026-10-15T08:00:00Z",
      referrer: "",
      landingUrl: "https://example.com/?utm_source=%00&utm_medium=cpc",
      campaign: { utm_source: "\u0000", utm_medium: "cpc" },
    });
    expect(result.campaign.utm_source).toBeUndefined();
    expect(result.campaign.utm_medium).toBe("cpc");
    expect(result.landingUrl).toBe("https://example.com/?utm_medium=cpc");
  });
  it("discards an unsupported entry year without discarding the campaign", () => {
    const result = attributionSchema.parse({
      version: 1,
      enteredAt: "0000-01-01T00:00:00Z",
      campaign: { utm_source: "ads" },
    });
    expect(result.enteredAt).toBeNull();
    expect(result.campaign.utm_source).toBe("ads");
    expect(
      attributionSchema.parse({
        version: 1,
        enteredAt: "0001-01-01T00:00:00Z",
        campaign: {},
      }).enteredAt,
    ).toBe("0001-01-01T00:00:00Z");
  });
  it("cleans newly captured campaign values from an encoded null byte", () => {
    window.history.replaceState(null, "", "/?utm_source=%00&utm_medium=cpc");
    try {
      const result = captureAttribution();
      expect(result.campaign.utm_source).toBeUndefined();
      expect(result.campaign.utm_medium).toBe("cpc");
      expect(result.landingUrl).not.toContain("utm_source");
    } finally {
      window.history.replaceState(null, "", "/");
    }
  });
  it("sanitizes tampered stored context and discards unrelated keys", () => {
    sessionStorage.setItem(
      "kvarta.attribution.v1",
      JSON.stringify({
        version: 1,
        enteredAt: "2026-10-15T08:00:00.000Z",
        landingUrl:
          "https://user:secret@example.com/?token=private&utm_source=ads#request",
        referrer: "javascript:alert(1)",
        campaign: { utm_source: "ads", secret: "discard" },
      }),
    );
    const result = captureAttribution();
    expect(result.landingUrl).toBe("https://example.com/?utm_source=ads");
    expect(result.referrer).toBe("");
    expect(result.campaign).toEqual({ utm_source: "ads" });
  });
  it("does not reject a valid lead for missing or malformed optional context", () => {
    const result = leadSchema.parse({
      name: "Test",
      phone: "+375291234567",
      interest: "question",
      productId: null,
      attribution: { invalid: true },
      submissionUrl: "data:secret",
    });
    expect(result.comment).toBe("");
    expect(result.attribution).toBeNull();
    expect(result.submissionUrl).toBe("");
  });
  it("keeps allowlisted campaign values and removes unrelated query data", () => {
    expect(
      sanitizePageUrl(
        "https://example.com/coffee?utm_source=instagram&token=private#request",
      ),
    ).toBe("https://example.com/coffee?utm_source=instagram");
    expect(sanitizePageUrl("javascript:alert(1)")).toBe("");
    expect(sanitizePageUrl("https://user:pass@example.com/")).toBe(
      "https://example.com/",
    );
  });
  it("preserves a tab's original visit through anchor navigation", () => {
    const initial = captureAttribution();
    window.history.replaceState(null, "", "/?utm_source=changed#request");
    expect(captureAttribution()).toEqual(initial);
    window.history.replaceState(null, "", "/");
  });
  it("continues when session storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    expect(captureAttribution().version).toBe(1);
  });
});
