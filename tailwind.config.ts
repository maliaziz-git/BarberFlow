import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#16a34a", // Signature vibrant studio green from the modern salon interior
          600: "#15803d",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
        },
        studio: {
          white: "#ffffff",
          offwhite: "#f8fafc",
          muted: "#f1f5f9",
          slate: "#64748b",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
