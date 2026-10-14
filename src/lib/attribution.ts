import { attributionSchema, type Attribution } from "./lead-contract";

const campaignKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
const storageKey = "kvarta.attribution.v1";

export function sanitizePageUrl(value: string): string {
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

export function captureAttribution(): Attribution {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const parsed = attributionSchema.safeParse(JSON.parse(stored));
      if (parsed.success) return parsed.data;
    }
  } catch {
    /* Tracking must never block the request form. */
  }

  const parameters = new URLSearchParams(window.location.search);
  const campaign: Attribution["campaign"] = {};
  for (const key of campaignKeys) {
    const value = parameters.get(key);
    if (value) campaign[key] = value.slice(0, 256);
  }
  const attribution: Attribution = {
    version: 1,
    landingUrl: sanitizePageUrl(window.location.href),
    referrer: sanitizePageUrl(document.referrer),
    enteredAt: new Date().toISOString(),
    campaign,
  };
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(attribution));
  } catch {
    /* Retain the in-memory record if storage is unavailable. */
  }
  return attribution;
}
