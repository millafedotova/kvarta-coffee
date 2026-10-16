import { z } from "zod";
import { ruErrors } from "@/i18n/dictionaries/ru-errors";
import {
  leadFields,
  leadErrorCodes,
  isLeadErrorCode,
  type FieldErrorCodes,
  type LeadErrorCode,
  type LeadField,
} from "./lead-errors";
import { pageUrlSchema } from "./page-context";
import {
  attributionSchema,
  interests,
  productIdSchema,
  productIdsSchema,
  productQuantitiesSchema,
  type FieldErrors,
} from "./lead-contract";

export function normalizeBelarusPhone(value: string): string | null {
  const compact = value.replace(
    /[\s().\p{Dash_Punctuation}\u2212\u200B-\u200F\u2060\uFEFF]/gu,
    "",
  );
  if (!/^\+?\d+$/.test(compact)) return null;
  // Validate the national format without rejecting codes missing from a directory.
  const national = compact.startsWith("+375")
    ? compact.slice(4)
    : compact.startsWith("375") && compact.length === 12
      ? compact.slice(3)
      : compact.startsWith("80") && compact.length === 11
        ? compact.slice(2)
        : compact;
  return /^[1-9]\d{8}$/.test(national) ? `+375${national}` : null;
}

const phoneSchema = z
  .string()
  .trim()
  .min(1, "phoneRequired")
  .max(64, "phoneTooLong")
  .transform((value, context) => {
    const phone = normalizeBelarusPhone(value);
    if (!phone) {
      context.addIssue({
        code: "custom",
        message: "phoneInvalid",
      });
      return z.NEVER;
    }
    return phone;
  });

export const draftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "nameRequired")
      .max(100, "nameTooLong")
      .refine((value) => !value.includes("\u0000"), "nameInvalid"),
    phone: phoneSchema,
    interest: z.enum(interests, { error: "interestRequired" }),
    productId: productIdSchema,
    productIds: productIdsSchema,
    productQuantities: productQuantitiesSchema,
    comment: z
      .string()
      .trim()
      .max(1000, "commentTooLong")
      .refine((value) => !value.includes("\u0000"), "commentInvalid")
      .default(""),
  })
  .superRefine((value, context) => {
    if (
      value.interest !== "one_time" &&
      (value.productId !== null || value.productIds?.length)
    ) {
      context.addIssue({
        code: "custom",
        path: ["productId"],
        message: "productSelectionInvalid",
      });
    }
    const selectedIds =
      value.productIds ?? (value.productId ? [value.productId] : []);
    if (
      Object.keys(value.productQuantities ?? {}).some(
        (id) => !selectedIds.some((selected) => selected === id),
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["productQuantities"],
        message: "quantitiesInvalid",
      });
    }
    if (
      value.productIds !== undefined &&
      value.productId !== null &&
      value.productIds[0] !== value.productId
    ) {
      context.addIssue({
        code: "custom",
        path: ["productIds"],
        message: "productsInvalid",
      });
    }
  });

export const leadSchema = draftSchema.safeExtend({
  attribution: attributionSchema.nullable().catch(null),
  submissionUrl: pageUrlSchema,
});
export type LeadInput = z.infer<typeof leadSchema>;

const fallbackErrors: Record<LeadField, LeadErrorCode> = {
  name: "nameRequired",
  phone: "phoneInvalid",
  interest: "interestRequired",
  comment: "commentInvalid",
  productId: "productsInvalid",
  productIds: "productsInvalid",
  productQuantities: "quantitiesInvalid",
};

export function getFieldErrorCodes(error: z.ZodError): FieldErrorCodes {
  const result: FieldErrorCodes = {};
  for (const field of leadFields) {
    const issue = error.issues.find((item) => item.path[0] === field);
    if (issue)
      result[field] = isLeadErrorCode(issue.message)
        ? issue.message
        : fallbackErrors[field];
  }
  return result;
}

export function getFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  const codes = getFieldErrorCodes(error);
  for (const field of leadFields) {
    const code = codes[field];
    if (code) result[field] = ruErrors[code];
  }
  return result;
}

export function resolveServerErrors(
  errors: FieldErrors,
  codes?: FieldErrors,
): FieldErrorCodes {
  const result: FieldErrorCodes = {};
  for (const field of leadFields) {
    if (errors[field] === undefined && codes?.[field] === undefined) continue;
    const code = codes?.[field];
    if (isLeadErrorCode(code)) result[field] = code;
    else
      result[field] =
        leadErrorCodes.find(
          (legacyCode) => ruErrors[legacyCode] === errors[field],
        ) ?? fallbackErrors[field];
  }
  return result;
}
