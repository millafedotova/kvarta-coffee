import { responseSchema, type LeadResponse } from "./lead-contract";
import type { LeadInput } from "./lead-validation";

export type SubmissionResult = LeadResponse | { status: "network_error" };

export async function submitLead(input: LeadInput): Promise<SubmissionResult> {
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });
    const body: unknown = await response.json();
    const parsed = responseSchema.safeParse(body);
    if (!parsed.success) return { status: "network_error" };
    const expected = {
      created: 201,
      duplicate: 200,
      invalid: 400,
      too_large: 413,
      unavailable: 503,
    };
    return response.status === expected[parsed.data.status]
      ? parsed.data
      : { status: "network_error" };
  } catch {
    return { status: "network_error" };
  }
}
