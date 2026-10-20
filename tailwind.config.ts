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
        family: {
          red: {
            50: "#fdf2f2",
            100: "#fde8e8",
            200: "#fbd5d5",
            300: "#f8b4b4",
            500: "#c81e1e",
            600: "#9b1c1c",
            700: "#8B1E1E", // Crimson hoành phi
            800: "#771d1d",
            900: "#5c1515",
          },
          gold: {
            50: "#fbf8ef",
            100: "#f7f0dc",
            200: "#eee0b8",
            300: "#e4cc8c",
            400: "#d9b460",
            500: "#C59B27", // Hoàng kim cổ
            600: "#a97d1b",
            700: "#865e17",
            800: "#6e4a19",
          },
          wood: {
            50: "#f8f6f0",
            100: "#ede7dc",
            200: "#dbcbb7",
            300: "#c4a88c",
            500: "#8f6745",
            700: "#4A2E18", // Gỗ lim
            800: "#382212",
            900: "#24150b",
          },
          parchment: {
            50: "#FFFEFA",
            100: "#FAF7EE",
            200: "#F4EEDC",
            300: "#E9DFBF",
            400: "#D8C798",
          }
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      boxShadow: {
        'traditional': '0 4px 20px -2px rgba(139, 30, 30, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
};
export default config;
