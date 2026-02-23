import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        wood: {
          50: "#f5efe7",
          100: "#e8dcc8",
          200: "#d4a574",
          300: "#c9a774",
          400: "#b8860b",
          500: "#a0826d",
          600: "#8b6f47",
          700: "#6b5436",
          800: "#4a3a2a",
          900: "#2c2c2c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
