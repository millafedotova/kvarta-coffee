import { describe, expect, it, vi } from "vitest";
import { captureAttribution, sanitizePageUrl } from "../src/lib/attribution";

describe("campaign attribution", () => {
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
