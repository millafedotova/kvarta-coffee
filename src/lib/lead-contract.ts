import { z } from "zod";
import { productIds, type ProductId } from "../content/coffee";

export const interests = ["subscription", "one_time", "question"] as const;
export type Interest = (typeof interests)[number];
export type Selection =
  | { interest: "one_time"; productId: ProductId | null }
  | { interest: "subscription" | "question" | null; productId: null };

export const campaignSchema = z.object({
  utm_source: z.string().max(256).optional(),
  utm_medium: z.string().max(256).optional(),
  utm_campaign: z.string().max(256).optional(),
  utm_content: z.string().max(256).optional(),
  utm_term: z.string().max(256).optional(),
});
export const attributionSchema = z.object({
  version: z.literal(1),
  landingUrl: z.string().max(2048),
  referrer: z.string().max(2048),
  enteredAt: z.string().datetime(),
  campaign: campaignSchema,
});
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
export const productIdSchema = z.enum(productIds).nullable();

export type RequestState =
  | { type: "idle" | "submitting" | "success" | "duplicate" }
  | { type: "error"; message: string };
