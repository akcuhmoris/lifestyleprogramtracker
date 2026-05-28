import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0B",
          elevated: "#131316",
          card: "#17171B",
          hover: "#1D1D22",
        },
        border: {
          DEFAULT: "#26262C",
          subtle: "#1F1F24",
        },
        text: {
          DEFAULT: "#F4F4F5",
          muted: "#A1A1AA",
          dim: "#71717A",
        },
        accent: {
          DEFAULT: "#0EA5FF",
          glow: "#3DBDFF",
          deep: "#0284C7",
        },
        state: {
          partial: "#F5C518",
          miss: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(14, 165, 255, 0.35)",
        "glow-lg": "0 0 48px rgba(14, 165, 255, 0.5)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.5)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ring-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.08)", opacity: "0.2" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "ring-pulse": "ring-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
