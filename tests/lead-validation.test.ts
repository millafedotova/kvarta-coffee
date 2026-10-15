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
  it("normalizes punctuation into one canonical number", () => {
    expect(normalizeBelarusPhone("+375 (29) 123-45-67")).toBe("+375291234567");
    expect(normalizeBelarusPhone("+375291234567")).toBe("+375291234567");
  });
  it("rejects the wrong country, incomplete input, and surrounding prose", () => {
    for (const number of [
      "+7 999 123 45 67",
      "+375 29 12",
      "call +375291234567",
      "+375001234567",
    ])
      expect(normalizeBelarusPhone(number)).toBeNull();
  });
  it("accepts a valid Belarusian fixed-line format", () => {
    expect(normalizeBelarusPhone("+375 17 123-45-67")).toBe("+375171234567");
  });
});

describe("lead draft contract", () => {
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
