import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1db954",
          "green-dim": "rgba(29,185,84,0.12)",
          "green-glow": "rgba(29,185,84,0.35)",
          black: "#080808",
          surface: "#0f0f0f",
          card: "#141414",
          border: "#1e1e1e",
          muted: "#555555",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "cursive"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-lora)", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease both",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-dot": "pulseDot 2s ease infinite",
        bounce3: "bounce3 0.9s ease infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px) scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        bounce3: {
          "0%,100%": { transform: "translateY(0)", opacity: "0.3" },
          "50%": { transform: "translateY(-6px)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
