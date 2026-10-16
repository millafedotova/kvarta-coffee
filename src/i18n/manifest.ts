import type { MetadataRoute } from "next";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

export function localizedManifest(
  locale: Locale,
  dictionary: Dictionary,
): MetadataRoute.Manifest {
  return {
    id: `/${locale}`,
    name: dictionary.metadata.manifest,
    short_name: dictionary.brand,
    lang: locale,
    start_url: `/${locale}`,
    scope: "/",
    display: "browser",
    background_color: "#F7F8F6",
    theme_color: "#1D5C4A",
    icons: [
      { src: "/icons/star-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/star-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
