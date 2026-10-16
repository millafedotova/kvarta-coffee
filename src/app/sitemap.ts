import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { languageAlternates, siteOrigin } from "@/i18n/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const languages = Object.fromEntries(
    Object.entries(languageAlternates()).map(([locale, path]) => [
      locale,
      new URL(path, origin).toString(),
    ]),
  );
  return locales.map((locale) => ({
    url: new URL(`/${locale}`, origin).toString(),
    alternates: { languages },
  }));
}
