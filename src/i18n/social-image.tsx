import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatMessage } from "@/i18n/format";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function createSocialImage(locale: Locale) {
  const dictionary = await getDictionary(locale);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0E352B",
        color: "#F7F8F6",
        display: "flex",
        flexDirection: "column",
        padding: "48px 60px",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <span>{dictionary.header.workshop}</span>
        <span>{dictionary.header.location}</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 174,
          letterSpacing: "-9px",
          fontWeight: 700,
          alignItems: "center",
          gap: 32,
        }}
      >
        {dictionary.brand.toUpperCase()}
        <svg
          width="92"
          height="92"
          viewBox="0 0 64 64"
          fill="none"
          stroke="#F7F8F6"
          strokeWidth="3"
        >
          <path d="M32 6v52M6 32h52M13.615 13.615l36.77 36.77M13.615 50.385l36.77-36.77" />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 48,
          lineHeight: 1.2,
        }}
      >
        <span>{dictionary.metadata.previewRoast}</span>
        <span>{dictionary.metadata.previewDeliver}</span>
      </div>
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #52635B",
          paddingTop: 20,
          justifyContent: "space-between",
          color: "#B9CEC3",
          fontSize: 20,
        }}
      >
        <span>
          {formatMessage(dictionary.metadata.previewBatch, {
            batch: site.batchWeightKg,
          })}
        </span>
        <span>{dictionary.metadata.previewProducts}</span>
      </div>
    </div>,
    size,
  );
}
