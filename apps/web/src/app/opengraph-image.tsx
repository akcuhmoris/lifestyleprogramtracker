import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Program — Track any lifestyle program";
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1100px 600px at 78% -10%, rgba(14,165,255,0.45), transparent 60%), radial-gradient(900px 500px at 12% 105%, rgba(14,165,255,0.22), transparent 65%), #0A0A0B",
          color: "#F4F4F5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: 9999,
            border: "1px solid rgba(14,165,255,0.45)",
            background: "rgba(14,165,255,0.12)",
            color: "#3DBDFF",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#0EA5FF",
              marginRight: 10,
            }}
          />
          Lifestyle program tracker
        </div>

        {/* Main heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            fontSize: 96,
            lineHeight: 1.04,
            letterSpacing: -2,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              backgroundImage:
                "linear-gradient(110deg, #FFFFFF 0%, #B9E2FF 45%, #3DBDFF 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Track any program.
          </span>
          <span style={{ color: "#F4F4F5" }}>Your tasks. Your rules.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            color: "#A1A1AA",
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          75 Hard, 100 Hard, or a routine you invented. The polish to make every
          check feel earned.
        </div>

        {/* Footer mark */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#0EA5FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0B",
              fontWeight: 800,
              fontSize: 18,
              boxShadow: "0 0 24px rgba(14,165,255,0.35)",
            }}
          >
            P
          </div>
          <div style={{ color: "#F4F4F5", fontSize: 24, fontWeight: 700 }}>
            Program
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
