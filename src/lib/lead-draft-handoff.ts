import { z } from "zod";
import { productIds } from "@/content/coffee";
import { locales, type Locale } from "@/i18n/config";
import { feedbackCodes, leadErrorCodes, leadFields } from "./lead-errors";
import type { FieldErrorCodes } from "./lead-errors";
import type { LeadDraft, RequestState, Selection } from "./lead-contract";

const storageKey = "kvarta.locale-handoff.v1";
const historyKey = "kvarta.locale-history.v1";
const maxAge = 10 * 60 * 1000;
const selectionSchema = z
  .object({
    interest: z.enum(["one_time", "subscription", "question"]).nullable(),
    productId: z.enum(productIds).nullable(),
    productIds: z.array(z.enum(productIds)).max(4).optional(),
    productQuantities: z
      .partialRecord(z.enum(productIds), z.number().int().min(1).max(5))
      .optional(),
  })
  .superRefine((value, context) => {
    const ids = value.productIds ?? (value.productId ? [value.productId] : []);
    if (
      new Set(ids).size !== ids.length ||
      (value.interest !== "one_time" &&
        (ids.length > 0 || value.productId !== null)) ||
      value.productId !== (ids[0] ?? null) ||
      Object.keys(value.productQuantities ?? {}).some(
        (id) => !ids.some((selected) => selected === id),
      )
    )
      context.addIssue({ code: "custom", message: "Invalid selection" });
  })
  .transform((value): Selection =>
    value.interest === "one_time"
      ? { ...value, interest: "one_time" }
      : {
          interest: value.interest,
          productId: null,
          productIds: [],
          productQuantities: {},
        },
  );

const snapshotSchema = z.object({
  version: z.literal(1),
  source: z.enum(locales),
  target: z.enum(locales),
  createdAt: z.number().finite(),
  draft: z.object({
    name: z.string().max(100),
    phone: z.string().max(64),
    comment: z.string().max(1000),
  }),
  selection: selectionSchema,
  errors: z.partialRecord(z.enum(leadFields), z.enum(leadErrorCodes)),
  state: z.discriminatedUnion("type", [
    z.object({ type: z.enum(["idle", "success", "duplicate"]) }),
    z.object({ type: z.literal("error"), code: z.enum(feedbackCodes) }),
  ]),
});

export function saveDraftHandoff(
  source: Locale,
  target: Locale,
  draft: LeadDraft,
  selection: Selection,
  errors: FieldErrorCodes,
  state: RequestState,
): boolean {
  if (state.type === "submitting") return false;
  try {
    // Round-trip JSON removes optional undefined error values before validation.
    const input: unknown = JSON.parse(
      JSON.stringify({
        version: 1,
        source,
        target,
        createdAt: Date.now(),
        draft,
        selection,
        errors,
        state,
      }),
    );
    const snapshot = snapshotSchema.safeParse(input);
    if (!snapshot.success) return false;
    sessionStorage.setItem(storageKey, JSON.stringify(snapshot.data));
    // Keep one bounded snapshot for Back/Forward after the one-time handoff is consumed.
    sessionStorage.setItem(historyKey, JSON.stringify(snapshot.data));
    return true;
  } catch {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // A blocked storage API must not interfere with staying on this page.
    }
    return false;
  }
}

export function readHistoryDraft() {
  try {
    const stored = sessionStorage.getItem(historyKey);
    if (!stored) return null;
    const parsed = snapshotSchema.safeParse(JSON.parse(stored));
    const age = parsed.success ? Date.now() - parsed.data.createdAt : -1;
    if (!parsed.success || age < 0 || age > maxAge) {
      sessionStorage.removeItem(historyKey);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function updateHistoryDraft(
  locale: Locale,
  draft: LeadDraft,
  selection: Selection,
  errors: FieldErrorCodes,
  state: RequestState,
) {
  // Continuity is armed only by an explicit language switch and expires with that session.
  if (!readHistoryDraft()) return;
  try {
    const input: unknown = JSON.parse(
      JSON.stringify({
        version: 1,
        source: locale,
        target: locale,
        createdAt: Date.now(),
        draft,
        selection,
        errors,
        state:
          state.type === "submitting"
            ? { type: "error", code: "networkError" }
            : state,
      }),
    );
    const snapshot = snapshotSchema.safeParse(input);
    if (snapshot.success)
      sessionStorage.setItem(historyKey, JSON.stringify(snapshot.data));
  } catch {
    // History restoration must not interfere with leaving the page.
  }
}

export function consumeDraftHandoff(locale: Locale) {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return null;
    sessionStorage.removeItem(storageKey);
    const parsed = snapshotSchema.safeParse(JSON.parse(stored));
    if (!parsed.success) return null;
    const value = parsed.data;
    const age = Date.now() - value.createdAt;
    if (
      value.target !== locale ||
      age < 0 ||
      age > maxAge ||
      value.source === value.target
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function readVisibleDraft(form: HTMLFormElement): LeadDraft {
  // Read controls even if a disabled fieldset excludes them from FormData.
  const read = (name: string) => {
    const control = form.elements.namedItem(name);
    return control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement
      ? control.value
      : "";
  };
  return { name: read("name"), phone: read("phone"), comment: read("comment") };
}
