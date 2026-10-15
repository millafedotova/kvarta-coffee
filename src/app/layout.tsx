import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.SITE_URL;
export const metadata: Metadata = {
  ...(siteUrl
    ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } }
    : {}),
  title: "Кварта — кофе свежей обжарки в Минске",
  description:
    "В четверг обжариваем, в пятницу привозим. Кофе партиями по 5 кг, дрипы и подписка — 2 пачки по 250 г за 54 BYN в месяц.",
  openGraph: {
    title: "Кварта — кофе свежей обжарки в Минске",
    description:
      "Маленькая мастерская обжарки в Минске. В четверг обжариваем. В пятницу — к вам.",
    locale: "ru_BY",
    type: "website",
    siteName: "Кварта",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
