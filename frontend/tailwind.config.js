/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Lions PU College institutional identity — navy/blue + gold/yellow.
        navy: {
          50: "#eef2f8",
          100: "#d6e0ee",
          200: "#adc1dd",
          300: "#7f9dc8",
          400: "#4f74a8",
          500: "#2f5488",
          600: "#1f3f6d",
          700: "#17325a",
          800: "#0f2242",
          900: "#0a172f",
          950: "#060f1e",
        },
        gold: {
          50: "#fdf8e8",
          100: "#faedc0",
          200: "#f6df8f",
          300: "#f1cd58",
          400: "#ecbd2e",
          500: "#dba614",
          600: "#b5850e",
          700: "#8c650c",
          800: "#664a0b",
          900: "#453209",
        },
        primary: {
          DEFAULT: "#17325a",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#dba614",
          foreground: "#0a172f",
        },
        muted: {
          DEFAULT: "#f4f6f9",
          foreground: "#5b6675",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
