import { z } from "zod";
import { productIds, type ProductId } from "../content/coffee";
import { attributionSchema } from "./page-context";
export { attributionSchema } from "./page-context";

export const interests = ["subscription", "one_time", "question"] as const;
export type Interest = (typeof interests)[number];
export type Selection =
  | { interest: "one_time"; productId: ProductId | null }
  | { interest: "subscription" | "question" | null; productId: null };

export type Attribution = z.infer<typeof attributionSchema>;
export type LeadDraft = { name: string; phone: string; comment: string };
export type FieldErrors = Partial<
  Record<"name" | "phone" | "interest" | "comment" | "productId", string>
>;

const fieldErrorSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  interest: z.string().optional(),
  comment: z.string().optional(),
  productId: z.string().optional(),
});
export const responseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("created") }),
  z.object({ status: z.literal("duplicate") }),
  z.object({ status: z.literal("invalid"), errors: fieldErrorSchema }),
  z.object({ status: z.literal("too_large") }),
  z.object({ status: z.literal("unavailable") }),
]);
export type LeadResponse = z.infer<typeof responseSchema>;
export const productIdSchema = z.enum(productIds).nullable().default(null);

export type RequestState =
  | { type: "idle" | "submitting" | "success" | "duplicate" }
  | { type: "error"; message: string };
