import { ImageResponse } from "next/og";

export const alt = "Кварта — кофе свежей обжарки в Минске";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <span>МАСТЕРСКАЯ ОБЖАРКИ КОФЕ</span>
        <span>МИНСК · С 2019 ГОДА</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 174,
          letterSpacing: "-9px",
          fontWeight: 700,
        }}
      >
        КВАРТА
      </div>
      <div style={{ display: "flex", fontSize: 48, lineHeight: 1.2 }}>
        В четверг обжариваем.
        <br />В пятницу — к вам.
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
        <span>НЕБОЛЬШИЕ ПАРТИИ ПО 5 КГ</span>
        <span>ЗЕРНО · ДРИПЫ · ПОДПИСКА</span>
      </div>
    </div>,
    size,
  );
}
