import { ImageResponse } from "next/og";

export const alt = "Sina Amareh — Software Developer · Backend & AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#08090a",
          color: "#f4f4f5",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(900px 600px at 85% -10%, rgba(124,92,252,0.40), transparent 60%)",
          }}
        />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            color: "#a78bfa",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          Python backend · AI / LLM engineer
        </div>
        <div style={{ fontSize: 104, fontWeight: 700, marginTop: 22, letterSpacing: -2 }}>
          Sina Amareh
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#8a8f98",
            marginTop: 18,
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          Resilient backend services & LLM-powered apps — multi-provider RAG, async APIs, and secure-by-default tooling.
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 26,
            color: "#a78bfa",
            fontFamily: "monospace",
          }}
        >
          sina.amareh
        </div>
      </div>
    ),
    { ...size },
  );
}
