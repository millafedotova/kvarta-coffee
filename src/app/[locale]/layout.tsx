import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedMetadata } from "@/i18n/metadata";
import { RecoveryProvider } from "@/components/recovery";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedMetadata(locale, await getDictionary(locale));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  return (
    <html lang={locale}>
      <body>
        <RecoveryProvider locale={locale} copy={dictionary.recovery}>
          {children}
        </RecoveryProvider>
      </body>
    </html>
  );
}
