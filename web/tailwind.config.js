/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af",
          400: "#fb7185", 500: "#f43f5e", 600: "#e11d48",
        },
        cream: { 50: "#FFFBF5", 100: "#FFF5E6", 200: "#FFE8CC" },
        amber: { 50: "#FFFBEB", 100: "#FEF3C7", 200: "#FDE68A", 400: "#FBBF24", 500: "#F59E0B", 600: "#D97706" },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
