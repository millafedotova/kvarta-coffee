import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";
import {
  attributionSchema,
  interests,
  productIdSchema,
  type FieldErrors,
} from "./lead-contract";

export function normalizeBelarusPhone(value: string): string | null {
  const phone = parsePhoneNumberFromString(value.trim(), {
    defaultCountry: "BY",
    extract: false,
  });
  return phone?.country === "BY" && phone.isValid() ? phone.number : null;
}

const phoneSchema = z
  .string()
  .max(64, "Проверьте номер телефона.")
  .transform((value, context) => {
    const phone = normalizeBelarusPhone(value);
    if (!phone) {
      context.addIssue({
        code: "custom",
        message: "Введите белорусский номер, например +375 29 123-45-67.",
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
      .max(100, "Введите имя не длиннее 100 символов."),
    phone: phoneSchema,
    interest: z.enum(interests, { error: "Выберите, что вас интересует." }),
    productId: productIdSchema,
    comment: z
      .string()
      .trim()
      .max(1000, "Сократите комментарий до 1000 символов."),
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
  attribution: attributionSchema.nullable(),
  submissionUrl: z.string().max(2048),
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
