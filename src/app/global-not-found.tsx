import type { Metadata } from "next";
import { locales, localeNames } from "@/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Kvarta",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="sectionSpace" style={{ paddingInline: 24 }}>
          <h1>404 — Kvarta</h1>
          <p className="recoveryCopy">
            Choose your language to return to the homepage.
          </p>
          {locales.map((locale) => (
            <a
              key={locale}
              className="recoveryAction"
              href={`/${locale}`}
              hrefLang={locale}
              lang={locale}
            >
              {localeNames[locale]}
            </a>
          ))}
        </main>
      </body>
    </html>
  );
}
