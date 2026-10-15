import { afterEach, expect, it, vi } from "vitest";
import { allowedOrigins } from "../src/lib/env";

afterEach(() => vi.unstubAllEnvs());

it("keeps local origins exact and rejects arbitrary forwarded hosts", () => {
  expect(allowedOrigins().has("http://localhost:3000")).toBe(true);
  expect(allowedOrigins().has("https://unrelated.vercel.app")).toBe(false);
});
it("requires explicit origin configuration in a deployment", () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("LEAD_ALLOWED_ORIGINS", "");
  expect(() => allowedOrigins()).toThrow();
});
it("allows configured production and preview origins without wildcard expansion", () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("SITE_URL", "https://kvarta.example");
  vi.stubEnv(
    "LEAD_ALLOWED_ORIGINS",
    "https://kvarta.example,https://kvarta-preview.vercel.app",
  );
  expect(allowedOrigins().size).toBe(2);
  expect(allowedOrigins().has("https://another-preview.vercel.app")).toBe(
    false,
  );
  vi.stubEnv("LEAD_ALLOWED_ORIGINS", "https://kvarta.example/path");
  expect(() => allowedOrigins()).toThrow();
});
