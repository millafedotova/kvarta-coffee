import { z } from "zod";
import { productIds, type ProductId } from "../content/coffee";
import { attributionSchema } from "./page-context";
import type { FeedbackCode } from "./lead-errors";
export { attributionSchema } from "./page-context";

export const interests = ["subscription", "one_time", "question"] as const;
export type Interest = (typeof interests)[number];
export type Selection =
  | {
      interest: "one_time";
      productId: ProductId | null;
      productIds?: ProductId[];
      productQuantities?: Partial<Record<ProductId, number>>;
    }
  | {
      interest: "subscription" | "question" | null;
      productId: null;
      productIds?: [];
      productQuantities?: Partial<Record<ProductId, number>>;
    };

export type Attribution = z.infer<typeof attributionSchema>;
export type LeadDraft = { name: string; phone: string; comment: string };
export type FieldErrors = Partial<
  Record<
    | "name"
    | "phone"
    | "interest"
    | "comment"
    | "productId"
    | "productIds"
    | "productQuantities",
    string
  >
>;

const fieldErrorSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  interest: z.string().optional(),
  comment: z.string().optional(),
  productId: z.string().optional(),
  productIds: z.string().optional(),
  productQuantities: z.string().optional(),
});
export const responseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("created") }),
  z.object({ status: z.literal("duplicate") }),
  z.object({
    status: z.literal("invalid"),
    errors: fieldErrorSchema,
    errorCodes: fieldErrorSchema.optional(),
  }),
  z.object({ status: z.literal("too_large") }),
  z.object({ status: z.literal("unavailable") }),
]);
export type LeadResponse = z.infer<typeof responseSchema>;
export const productIdSchema = z.enum(productIds).nullable().default(null);
export const productIdsSchema = z
  .array(z.enum(productIds))
  .max(4)
  .refine(
    (values) => new Set(values).size === values.length,
    "duplicateProducts",
  )
  .optional();

export const productQuantitiesSchema = z
  .partialRecord(z.enum(productIds), z.number().int().min(1).max(5))
  .optional();

export type RequestState =
  | { type: "idle" | "submitting" | "success" | "duplicate" }
  | { type: "error"; code: FeedbackCode };
