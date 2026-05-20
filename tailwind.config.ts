import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deama: {
          red: "#e10600",
          "red-hover": "#ff1a0d",
          gold: "#c9a14a",
          "gold-bright": "#e7c66c",
          black: "#0a0a0a",
          ink: "#141414",
          surface: "#1a1a1a",
          border: "#262626",
          muted: "#7a7a7a",
          text: "#ededed",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(225,6,0,0.4), 0 8px 24px rgba(225,6,0,0.25)",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(225,6,0,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(225,6,0,0)" },
        },
      },
      animation: {
        "pulse-red": "pulse-red 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
