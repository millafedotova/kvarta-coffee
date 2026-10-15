import { describe, expect, it } from "vitest";
import { draftSchema, normalizeBelarusPhone } from "../src/lib/lead-validation";

// Synthetic fixtures are used only in local tests; no real lead service is contacted.
const draft = {
  name: "Тест",
  phone: "+375 29 123-45-67",
  interest: "one_time",
  productId: "ethiopia-yirgacheffe",
  comment: "",
};

describe("Belarusian phone validation", () => {
  it.each([
    "+375 (29) 123-45-67",
    "+375 29 123 45 67",
    "+375.29.123.45.67",
    "+375291234567",
    "375291234567",
    "291234567",
    "29 123 45 67",
    "8 (029) 123-45-67",
    "80291234567",
    "+375\u00a029\u00a0123\u00a045\u00a067",
    "+375\u202f29\u202f123\u202f45\u202f67",
    "+375 29 123–45–67",
    "+375 29 123—45—67",
    "+375 29 123‑45‑67",
    "+375\u200b29\u200b1234567",
    "375\u2060291234567",
    "+375\u200e29 1234567",
  ])("normalizes the same phone written as %s", (number) => {
    expect(normalizeBelarusPhone(number)).toBe("+375291234567");
    expect(draftSchema.parse({ ...draft, phone: number }).phone).toBe(
      "+375291234567",
    );
  });
  it("rejects the wrong country, incomplete input, and surrounding prose", () => {
    for (const number of [
      "+7 999 123 45 67",
      "+375 29 12",
      "call +375291234567",
      "+375001234567",
      "+375291234567 ext 123",
      "++375291234567",
    ])
      expect(normalizeBelarusPhone(number)).toBeNull();
  });
  it("accepts a valid Belarusian fixed-line format", () => {
    expect(normalizeBelarusPhone("+375 17 123-45-67")).toBe("+375171234567");
  });
});

describe("lead draft contract", () => {
  it("asks for a missing number without implying a required punctuation format", () => {
    const result = draftSchema.safeParse({ ...draft, phone: " " });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({
        path: ["phone"],
        message: "Введите номер телефона.",
      });
  });
  it("rejects zero bytes in editable contact fields with field errors", () => {
    for (const field of ["name", "comment"] as const) {
      const result = draftSchema.safeParse({
        ...draft,
        [field]: "Test\u0000value",
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(
          result.error.issues.some((issue) => issue.path[0] === field),
        ).toBe(true);
    }
  });
  it("trims inputs and allows an empty optional comment", () => {
    const result = draftSchema.parse({
      ...draft,
      name: " Тест ",
      comment: " ",
    });
    expect(result.name).toBe("Тест");
    expect(result.comment).toBe("");
    expect(result.phone).toBe("+375291234567");
  });
  it("rejects a product attached to a subscription", () => {
    expect(
      draftSchema.safeParse({ ...draft, interest: "subscription" }).success,
    ).toBe(false);
  });
  it("requires an explicit interest and bounds comments", () => {
    expect(draftSchema.safeParse({ ...draft, interest: null }).success).toBe(
      false,
    );
    expect(
      draftSchema.safeParse({ ...draft, comment: "a".repeat(1001) }).success,
    ).toBe(false);
  });
});
