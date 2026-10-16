import { formattingLocales, type Locale } from "./config";

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(formattingLocales[locale], {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(value: number, locale: Locale): string {
  return `${formatNumber(value, locale)}\u00a0BYN`;
}

type Placeholder<T extends string> =
  T extends `${string}{${infer Name}}${infer Rest}`
    ? Name | Placeholder<Rest>
    : never;

export function formatMessage<T extends string>(
  message: T,
  values: Record<Placeholder<T>, string | number>,
): string {
  return message.replace(/\{([^{}]+)\}/g, (token, name: string) => {
    const value = Object.entries(values).find(([key]) => key === name)?.[1];
    return value === undefined ? token : String(value);
  });
}
