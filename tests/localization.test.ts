import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ru } from "../src/i18n/dictionaries/ru";
import { en } from "../src/i18n/dictionaries/en";
import { be } from "../src/i18n/dictionaries/be";
import { locales, localizedUrl, isLocale } from "../src/i18n/config";
import { formatMessage, formatPrice } from "../src/i18n/format";
import { localizedMetadata, siteOrigin } from "../src/i18n/metadata";
import { localizedManifest } from "../src/i18n/manifest";
import { localizeProducts } from "../src/i18n/products";
import {
  draftSchema,
  getFieldErrorCodes,
  getFieldErrors,
  resolveServerErrors,
} from "../src/lib/lead-validation";
import {
  consumeDraftHandoff,
  readHistoryDraft,
  saveDraftHandoff,
  updateHistoryDraft,
} from "../src/lib/lead-draft-handoff";
import { proxy } from "../src/proxy";

const dictionaries = { ru, en, be };

function strings(value: unknown, path = ""): Record<string, string> {
  if (typeof value === "string") return { [path]: value };
  if (!value || typeof value !== "object") return {};
  return Object.assign(
    {},
    ...Object.entries(value).map(([key, item]) =>
      strings(item, `${path}.${key}`),
    ),
  );
}

describe("complete locale content", () => {
  it.each(locales)(
    "covers all Russian content and matching placeholders in %s",
    (locale) => {
      const source = strings(ru);
      const translated = strings(dictionaries[locale]);
      expect(Object.keys(translated).sort()).toEqual(
        Object.keys(source).sort(),
      );
      for (const [key, text] of Object.entries(translated)) {
        expect(text.trim(), key).not.toBe("");
        expect((text.match(/\{\w+\}/g) ?? []).sort(), key).toEqual(
          (source[key].match(/\{\w+\}/g) ?? []).sort(),
        );
      }
    },
  );

  it("keeps shared product facts independent from the selected language", () => {
    const facts = locales.map((locale) =>
      localizeProducts(dictionaries[locale], locale).map(
        ({ id, price, package: pack, image }) => ({ id, price, pack, image }),
      ),
    );
    expect(facts[1]).toEqual(facts[0]);
    expect(facts[2]).toEqual(facts[0]);
    expect(facts[0].map(({ price }) => price)).toEqual([32, 29, 26, 18]);
    expect(localizeProducts(en, "en")[3].size).toBe("10 bags");
    expect(strings(en)).not.toEqual(strings(ru));
    expect(
      Object.values(strings(en)).some((text) => /[А-Яа-яЁёІіЎў]/.test(text)),
    ).toBe(false);
  });

  it("formats money and complete parameterized sentences", () => {
    expect(formatPrice(54, "be")).toBe("54\u00a0BYN");
    expect(
      formatMessage(en.form.subscriptionQuantity, { count: 2, weight: 250 }),
    ).toBe("2 bags of 250 g every month");
  });
});

describe("locale URL and entry policy", () => {
  it("changes locale, keeps encoded campaigns, and opens the top instead of the form anchor", () => {
    const url = localizedUrl(
      "https://example.com/ru?utm_campaign=en%2Fbe&other=a%2Bb#subscription",
      "be",
    );
    expect(url.pathname).toBe("/be");
    expect(url.search).toBe("?utm_campaign=en%2Fbe&other=a%2Bb");
    expect(url.hash).toBe("");
    expect(
      localizedUrl("https://example.com/?utm_source=ru", "en").pathname,
    ).toBe("/en");
    expect(isLocale("by")).toBe(false);
    expect(isLocale("constructor")).toBe(false);
  });

  it.each([
    [undefined, "ru"],
    ["be", "be"],
    ["en", "en"],
    ["by", "ru"],
    ["../../api", "ru"],
  ])("uses only an allowlisted explicit preference %s", (cookie, expected) => {
    const headers = cookie ? { cookie: `kvarta.locale=${cookie}` } : undefined;
    const response = proxy(
      new NextRequest("https://example.com/?utm_source=campaign", { headers }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://example.com/${expected}?utm_source=campaign`,
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
  });
});

describe("validation compatibility", () => {
  it("returns stable codes and preserves legacy human-readable errors", () => {
    const parsed = draftSchema.safeParse({
      name: "",
      phone: "+12025550123",
      interest: null,
    });
    if (parsed.success) throw new Error("Expected validation failure");
    const codes = getFieldErrorCodes(parsed.error);
    expect(codes).toMatchObject({
      name: "nameRequired",
      phone: "phoneInvalid",
      interest: "interestRequired",
    });
    expect(getFieldErrors(parsed.error).phone).toBe(ru.errors.phoneInvalid);
    expect(
      resolveServerErrors(
        { phone: "Unexpected legacy message" },
        { phone: "futureCode" },
      ),
    ).toEqual({ phone: "phoneInvalid" });
    expect(resolveServerErrors({ phone: ru.errors.phoneTooLong })).toEqual({
      phone: "phoneTooLong",
    });
  });
});

describe("temporary same-tab handoff", () => {
  const draft = {
    name: "Synthetic localization test",
    phone: "+12025550123",
    comment: "Без помола / без памолу",
  };
  const selection = {
    interest: "one_time",
    productId: "brazil-cerrado",
    productIds: ["brazil-cerrado", "colombia-huila"],
    productQuantities: { "brazil-cerrado": 4, "colombia-huila": 2 },
  } as const;
  const snapshotSelection = {
    ...selection,
    productIds: [...selection.productIds],
  };

  it("preserves even invalid input, multiple coffees, quantities, and feedback codes exactly once", () => {
    expect(
      saveDraftHandoff(
        "ru",
        "be",
        draft,
        snapshotSelection,
        { phone: "phoneInvalid" },
        { type: "error", code: "unavailable" },
      ),
    ).toBe(true);
    expect(consumeDraftHandoff("be")).toMatchObject({
      draft,
      selection: snapshotSelection,
      errors: { phone: "phoneInvalid" },
      state: { type: "error", code: "unavailable" },
    });
    expect(consumeDraftHandoff("be")).toBeNull();
  });

  it("rejects expired or wrong-destination snapshots and never stores pending requests", () => {
    expect(
      saveDraftHandoff(
        "ru",
        "en",
        draft,
        snapshotSelection,
        {},
        { type: "submitting" },
      ),
    ).toBe(false);
    saveDraftHandoff(
      "ru",
      "en",
      draft,
      snapshotSelection,
      {},
      { type: "success" },
    );
    expect(consumeDraftHandoff("be")).toBeNull();
    saveDraftHandoff(
      "ru",
      "en",
      draft,
      snapshotSelection,
      {},
      { type: "duplicate" },
    );
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 600001);
    expect(consumeDraftHandoff("en")).toBeNull();
  });

  it("treats unavailable storage as recoverable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Synthetic blocked storage");
    });
    expect(
      saveDraftHandoff(
        "ru",
        "be",
        draft,
        snapshotSelection,
        {},
        { type: "idle" },
      ),
    ).toBe(false);
  });

  it("removes a partial handoff if writing its history snapshot fails", () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === "kvarta.locale-history.v1")
        throw new Error("Synthetic history quota failure");
      originalSetItem.call(this, key, value);
    });
    expect(
      saveDraftHandoff(
        "ru",
        "en",
        draft,
        snapshotSelection,
        {},
        { type: "idle" },
      ),
    ).toBe(false);
    expect(sessionStorage.getItem("kvarta.locale-handoff.v1")).toBeNull();
    expect(consumeDraftHandoff("en")).toBeNull();
  });

  it("arms history continuity only after a language switch and keeps the latest draft", () => {
    updateHistoryDraft("ru", draft, snapshotSelection, {}, { type: "idle" });
    expect(readHistoryDraft()).toBeNull();
    saveDraftHandoff(
      "ru",
      "en",
      draft,
      snapshotSelection,
      {},
      { type: "idle" },
    );
    consumeDraftHandoff("en");
    const latest = { ...draft, comment: "Updated in English" };
    updateHistoryDraft(
      "en",
      latest,
      snapshotSelection,
      {},
      { type: "success" },
    );
    expect(readHistoryDraft()).toMatchObject({
      draft: latest,
      state: { type: "success" },
    });
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 600001);
    expect(readHistoryDraft()).toBeNull();
  });

  it("rejects malformed snapshots instead of restoring unvalidated selections", () => {
    saveDraftHandoff(
      "ru",
      "en",
      draft,
      snapshotSelection,
      {},
      { type: "idle" },
    );
    const stored = JSON.parse(
      sessionStorage.getItem("kvarta.locale-handoff.v1") ?? "null",
    );
    stored.selection.productQuantities["brazil-cerrado"] = 100;
    sessionStorage.setItem("kvarta.locale-handoff.v1", JSON.stringify(stored));
    expect(consumeDraftHandoff("en")).toBeNull();
  });
});

describe("locale metadata", () => {
  it.each(["", "   "])(
    "uses the local origin for a blank SITE_URL %j",
    (value) => {
      vi.stubEnv("SITE_URL", value);
      expect(siteOrigin().origin).toBe("http://localhost:3000");
    },
  );
  it.each(locales)(
    "uses a self canonical, reciprocal alternates, and matching manifest for %s",
    (locale) => {
      vi.stubEnv("SITE_URL", "https://example.com");
      const metadata = localizedMetadata(locale, dictionaries[locale]);
      expect(metadata.alternates?.canonical).toBe(`/${locale}`);
      expect(metadata.alternates?.languages).toEqual({
        ru: "/ru",
        en: "/en",
        be: "/be",
        "x-default": "/ru",
      });
      expect(metadata.manifest).toBe(`/${locale}/manifest.webmanifest`);
      expect(metadata.title).toBe(dictionaries[locale].metadata.title);
      expect(localizedManifest(locale, dictionaries[locale])).toMatchObject({
        lang: locale,
        start_url: `/${locale}`,
        short_name: dictionaries[locale].brand,
      });
    },
  );
});
