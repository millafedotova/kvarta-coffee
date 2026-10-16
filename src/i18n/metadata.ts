import "server-only";
import type { Metadata } from "next";
import { locales, openGraphLocales, type Locale } from "./config";
import { site } from "@/content/site";
import { formatMessage, formatPrice } from "./format";
import type { Dictionary } from "./types";

export function siteOrigin(): URL {
  return new URL(process.env.SITE_URL?.trim() || "http://localhost:3000");
}

export function languageAlternates() {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    "x-default": "/ru",
  };
}

export function localizedMetadata(
  locale: Locale,
  dictionary: Dictionary,
): Metadata {
  return {
    metadataBase: siteOrigin(),
    title: dictionary.metadata.title,
    description: formatMessage(dictionary.metadata.description, {
      batch: site.batchWeightKg,
      count: site.subscription.count,
      weight: site.subscription.weight,
      price: formatPrice(site.subscription.price, locale),
    }),
    alternates: { canonical: `/${locale}`, languages: languageAlternates() },
    manifest: `/${locale}/manifest.webmanifest`,
    openGraph: {
      title: dictionary.metadata.title,
      description: dictionary.metadata.socialDescription,
      url: `/${locale}`,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => openGraphLocales[other]),
      type: "website",
      siteName: dictionary.brand,
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: dictionary.metadata.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        { url: `/${locale}/opengraph-image`, alt: dictionary.metadata.title },
      ],
      title: dictionary.metadata.title,
      description: dictionary.metadata.socialDescription,
    },
  };
}
