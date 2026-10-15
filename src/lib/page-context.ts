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
      if (entry && !entry.includes("\u0000"))
        parameters.set(key, entry.slice(0, 256));
    }
    url.search = parameters.toString();
    const result = url.toString();
    return result.length <= 2048 ? result : "";
  } catch {
    return "";
  }
}

const campaignValueSchema = z
  .string()
  .max(256)
  .refine((value) => !value.includes("\u0000"))
  .optional()
  .catch(undefined);

export const campaignSchema = z.object({
  utm_source: campaignValueSchema,
  utm_medium: campaignValueSchema,
  utm_campaign: campaignValueSchema,
  utm_content: campaignValueSchema,
  utm_term: campaignValueSchema,
});
export const pageUrlSchema = z.unknown().transform(sanitizePageUrl).default("");
export const attributionSchema = z.object({
  version: z.literal(1),
  landingUrl: pageUrlSchema,
  referrer: pageUrlSchema,
  enteredAt: z
    .string()
    .datetime()
    .refine((value) => !value.startsWith("0000-"))
    .nullable()
    .catch(null),
  campaign: campaignSchema.catch({}),
});
