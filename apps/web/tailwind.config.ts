import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Mobile-first: base = small phones (320px+)
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Brand tokens — mirror src/styles/tokens.css
        forest: {
          DEFAULT: "#14532d",
          50: "#f0fdf4",
          100: "#dcfce7",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        leaf: {
          DEFAULT: "#22c55e",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        earth: {
          DEFAULT: "#d97706",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        sand: "#fef3c7",
        ink: "#0f172a",
        surface: {
          DEFAULT: "#f8fafc",
          dark: "#0b1220",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xs": "0.25rem",
        card: "1rem",
      },
      boxShadow: {
        geo: "0 8px 24px -12px rgba(20, 83, 45, 0.35)",
        "geo-lg": "0 16px 40px -16px rgba(20, 83, 45, 0.45)",
      },
      minHeight: {
        dvh: "100dvh",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};

export default config;
