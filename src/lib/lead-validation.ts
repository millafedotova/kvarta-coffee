import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";
import { pageUrlSchema } from "./page-context";
import {
  attributionSchema,
  interests,
  productIdSchema,
  type FieldErrors,
} from "./lead-contract";

export function normalizeBelarusPhone(value: string): string | null {
  const compact = value.replace(
    /[\s().\p{Dash_Punctuation}\u2212\u200B-\u200F\u2060\uFEFF]/gu,
    "",
  );
  if (!/^\+?\d+$/.test(compact)) return null;
  const phone = parsePhoneNumberFromString(compact, {
    defaultCountry: "BY",
    extract: false,
  });
  return phone?.country === "BY" && phone.isValid() ? phone.number : null;
}

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Введите номер телефона.")
  .max(64, "Проверьте номер телефона.")
  .transform((value, context) => {
    const phone = normalizeBelarusPhone(value);
    if (!phone) {
      context.addIssue({
        code: "custom",
        message: "Введите белорусский номер: +375291234567 или 291234567.",
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
      .min(1, "Как к вам обращаться?")
      .max(100, "Введите имя не длиннее 100 символов.")
      .refine(
        (value) => !value.includes("\u0000"),
        "Введите имя заново: в нём есть недопустимый символ.",
      ),
    phone: phoneSchema,
    interest: z.enum(interests, { error: "Выберите, что вас интересует." }),
    productId: productIdSchema,
    comment: z
      .string()
      .trim()
      .max(1000, "Сократите комментарий до 1000 символов.")
      .refine(
        (value) => !value.includes("\u0000"),
        "Введите комментарий заново или оставьте поле пустым.",
      )
      .default(""),
  })
  .superRefine((value, context) => {
    if (value.interest !== "one_time" && value.productId !== null) {
      context.addIssue({
        code: "custom",
        path: ["productId"],
        message: "Выберите кофе для разового заказа.",
      });
    }
  });

export const leadSchema = draftSchema.safeExtend({
  attribution: attributionSchema.nullable().catch(null),
  submissionUrl: pageUrlSchema,
});
export type LeadInput = z.infer<typeof leadSchema>;

export function getFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  const fields = ["name", "phone", "interest", "comment", "productId"] as const;
  for (const field of fields) {
    const issue = error.issues.find((item) => item.path[0] === field);
    if (issue) result[field] = issue.message;
  }
  return result;
}
