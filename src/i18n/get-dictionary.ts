import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

const loaders = {
  ru: () => import("./dictionaries/ru").then((module) => module.ru),
  en: () => import("./dictionaries/en").then((module) => module.en),
  be: () => import("./dictionaries/be").then((module) => module.be),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
