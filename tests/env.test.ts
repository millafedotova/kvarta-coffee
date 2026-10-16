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
it("allows only the active loopback port when development moves to another port", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("LEAD_ALLOWED_ORIGINS", "http://localhost:3000");
  const origins = allowedOrigins("http://127.0.0.1:3002/api/lead");
  expect(origins.has("http://127.0.0.1:3002")).toBe(true);
  expect(origins.has("http://localhost:3002")).toBe(true);
  expect(origins.has("http://localhost:3003")).toBe(false);
  expect(origins.has("https://unrelated.example")).toBe(false);
  expect(allowedOrigins("https://unrelated.example/api/lead").size).toBe(1);
});
it("does not infer allowed origins from the request URL in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("LEAD_ALLOWED_ORIGINS", "https://kvarta.example");
  const origins = allowedOrigins("http://127.0.0.1:3002/api/lead");
  expect([...origins]).toEqual(["https://kvarta.example"]);
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
