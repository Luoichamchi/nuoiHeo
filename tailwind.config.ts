import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9e9ff",
          200: "#bcd8ff",
          300: "#8fc0ff",
          400: "#5ea2ff",
          500: "#327eff",
          600: "#1e60e8",
          700: "#194bc4",
          800: "#1c419e",
          900: "#1d397d"
        }
      }
    }
  },
  plugins: []
};

export default config;
