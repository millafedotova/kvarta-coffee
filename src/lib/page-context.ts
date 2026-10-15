import { z } from "zod";

export const campaignKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export function sanitizePageUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096) return "";
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.username = "";
    url.password = "";
    url.hash = "";
    const parameters = new URLSearchParams();
    for (const key of campaignKeys) {
      const entry = url.searchParams.get(key);
      if (entry) parameters.set(key, entry.slice(0, 256));
    }
    url.search = parameters.toString();
    const result = url.toString();
    return result.length <= 2048 ? result : "";
  } catch {
    return "";
  }
}

export const campaignSchema = z.object({
  utm_source: z.string().max(256).optional().catch(undefined),
  utm_medium: z.string().max(256).optional().catch(undefined),
  utm_campaign: z.string().max(256).optional().catch(undefined),
  utm_content: z.string().max(256).optional().catch(undefined),
  utm_term: z.string().max(256).optional().catch(undefined),
});
export const pageUrlSchema = z.unknown().transform(sanitizePageUrl).default("");
export const attributionSchema = z.object({
  version: z.literal(1),
  landingUrl: pageUrlSchema,
  referrer: pageUrlSchema,
  enteredAt: z.string().datetime().nullable().catch(null),
  campaign: campaignSchema.catch({}),
});
