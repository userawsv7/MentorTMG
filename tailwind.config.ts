import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0e12",
          900: "#0f151b",
          850: "#131b22",
          800: "#182029",
          700: "#232e39",
          600: "#334152",
          500: "#4c6070",
          400: "#7c8fa0",
          300: "#aebac5",
          200: "#d3dbe2",
        },
        signal: {
          500: "#2dd4bf",
          400: "#5eead4",
          600: "#14b8a6",
        },
        amber: {
          500: "#f5a524",
        },
        flare: {
          500: "#ff6b57",
        },
      },
      fontFamily: {
        // display keeps a slightly tighter, geometric sans feel via weight/tracking
        // in globals.css (.font-display) rather than a distinct downloaded font.
        display: ["-apple-system", "'Segoe UI'", "'Helvetica Neue'", "system-ui", "sans-serif"],
        body: ["-apple-system", "'Segoe UI'", "system-ui", "sans-serif"],
        mono: ["'SF Mono'", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(45,212,191,0.15), 0 8px 30px rgba(45,212,191,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
