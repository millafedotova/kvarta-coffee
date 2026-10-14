import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Кварта — мастерская обжарки кофе",
  description: "Кофе свежей обжарки небольшими партиями в Минске.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
