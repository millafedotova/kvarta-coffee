import { isLocale, locales } from "@/i18n/config";
import { createSocialImage } from "@/i18n/social-image";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  return createSocialImage(locale);
}
