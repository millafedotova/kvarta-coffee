import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedManifest } from "@/i18n/manifest";

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
  return Response.json(localizedManifest(locale, await getDictionary(locale)), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
