import { products, type CoffeeProduct } from "@/content/coffee";
import type { Locale } from "./config";
import { formatMessage, formatNumber } from "./format";
import type { Dictionary, ProductCopy } from "./types";

export type LocalizedCoffee = CoffeeProduct & ProductCopy & { size: string };

export function localizeProducts(
  dictionary: Dictionary,
  locale: Locale,
): LocalizedCoffee[] {
  return products.map((product) => ({
    ...product,
    ...dictionary.products[product.id],
    size: formatMessage(dictionary.catalog[product.package.kind], {
      count: formatNumber(product.package.count, locale),
    }),
  }));
}
