export const locales = ["ru", "en", "be"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";
export const localeCookie = "kvarta.locale";
export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  be: "Беларуская",
};
export const formattingLocales: Record<Locale, string> = {
  ru: "ru-BY",
  en: "en",
  be: "be-BY",
};
export const openGraphLocales: Record<Locale, string> = {
  ru: "ru_BY",
  en: "en_US",
  be: "be_BY",
};

export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localizedUrl(current: string, locale: Locale): URL {
  const url = new URL(current);
  const segments = url.pathname.split("/");
  if (isLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  url.pathname = segments.join("/").replace(/\/$/, "");
  url.hash = "";
  return url;
}
