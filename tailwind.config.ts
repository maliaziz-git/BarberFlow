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
        brand: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#c28e5c", // Warm artisan barber amber/gold
          600: "#b07b46",
          700: "#8e5b2f",
          800: "#69401f",
          900: "#442711",
        },
        dark: {
          800: "#18181b",
          900: "#0f0f12",
          950: "#09090b",
        }
      },
    },
  },
  plugins: [],
};
export default config;
