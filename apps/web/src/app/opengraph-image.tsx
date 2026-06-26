import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lifestyle Program Tracker — Build the habit that builds you";
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
          padding: "80px",
          background:
            "radial-gradient(900px 540px at 50% -10%, rgba(165,180,252,0.20), transparent 65%), radial-gradient(700px 420px at 50% 110%, rgba(165,180,252,0.10), transparent 70%), #14141d",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Centered glyph */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "linear-gradient(160deg, #a5b4fc 0%, #818cf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#14141d",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: -2,
            boxShadow:
              "0 0 80px rgba(165,180,252,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
            marginBottom: 48,
          }}
        >
          L
        </div>

        {/* Brand wordmark */}
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 84,
            lineHeight: 1.05,
            letterSpacing: -3,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Lifestyle Program Tracker
        </div>

        {/* Value prop */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            color: "#a5b4fc",
            fontSize: 36,
            lineHeight: 1.3,
            letterSpacing: -0.5,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Build the habit that builds you.
        </div>

        {/* Footer mark */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "rgba(255,255,255,0.45)",
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: "#a5b4fc",
            }}
          />
          75 Hard · 100 Hard · Your Own Routine
        </div>
      </div>
    ),
    { ...size }
  );
}
