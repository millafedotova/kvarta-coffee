export const leadFields = [
  "name",
  "phone",
  "interest",
  "comment",
  "productId",
  "productIds",
  "productQuantities",
] as const;
export type LeadField = (typeof leadFields)[number];

export const leadErrorCodes = [
  "nameRequired",
  "nameTooLong",
  "nameInvalid",
  "phoneRequired",
  "phoneTooLong",
  "phoneInvalid",
  "interestRequired",
  "commentTooLong",
  "commentInvalid",
  "productSelectionInvalid",
  "duplicateProducts",
  "productsInvalid",
  "quantitiesInvalid",
  "fieldInvalid",
] as const;
export type LeadErrorCode = (typeof leadErrorCodes)[number];
export type FieldErrorCodes = Partial<Record<LeadField, LeadErrorCode>>;

export function isLeadErrorCode(value: unknown): value is LeadErrorCode {
  return leadErrorCodes.some((code) => code === value);
}

export const feedbackCodes = [
  "invalidFields",
  "invalidRequest",
  "tooLarge",
  "unavailable",
  "networkError",
] as const;
export type FeedbackCode = (typeof feedbackCodes)[number];
