import { getDictionary } from "@/i18n/get-dictionary";
import { localizedManifest } from "@/i18n/manifest";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(localizedManifest("ru", await getDictionary("ru")), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
