/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6C5CE7",
          teal: "#12C7B4",
          gold: "#E0A23B",
          dark: "#0B0B12",
          darker: "#14151C",
        },
      },
    },
  },
  plugins: [],
};
