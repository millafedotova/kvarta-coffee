import { attributionSchema, type Attribution } from "./lead-contract";

import { campaignKeys, campaignSchema, sanitizePageUrl } from "./page-context";
export { sanitizePageUrl } from "./page-context";

const storageKey = "kvarta.attribution.v1";

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
    campaign: campaignSchema.parse(campaign),
  };
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(attribution));
  } catch {
    /* Retain the in-memory record if storage is unavailable. */
  }
  return attribution;
}
