import { ImageResponse } from "next/og";

export const alt = "History Before Us";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#faf8f4",
          color: "#1c1a17",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 18,
            background: "#7c4a2d",
            color: "#faf8f4",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
          }}
        >
          H
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>
          History Before Us
        </div>
        <div style={{ fontSize: 28, color: "#7c4a2d" }}>
          A student history club
        </div>
      </div>
    ),
    { ...size },
  );
}
