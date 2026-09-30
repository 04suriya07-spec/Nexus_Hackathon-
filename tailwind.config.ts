import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050A12",
        surface: "#0B1526",
        elevated: "#101F38",
        border: "#1E3354",
        ice: {
          50: "#e0f7fe",
          100: "#b9eefd",
          200: "#80e1fb",
          300: "#40d0f7",
          400: "#13B5EA",
          500: "#009bd4",
          600: "#007cb3",
          700: "#026390",
          800: "#065376",
          900: "#0a4563",
        },
        maitri: "#FF9F0A",
        bharati: "#13B5EA",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
