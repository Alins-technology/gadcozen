/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8fa",
          100: "#d9eef2",
          200: "#b6dee6",
          300: "#86c7d4",
          400: "#4fa8ba",
          500: "#2d8b9e",
          600: "#037D8F", // primary
          700: "#046573",
          800: "#0a505c",
          900: "#0c434d",
          950: "#052b32",
        },
        ink: {
          900: "#12262b",
          700: "#2c4249",
          500: "#5b6f75",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px rgba(3, 125, 143, 0.08)",
        card: "0 1px 3px rgba(12, 67, 77, 0.06), 0 8px 24px rgba(12, 67, 77, 0.06)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
