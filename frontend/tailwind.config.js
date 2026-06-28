/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8f7ee",
          100: "#c5ebd5",
          200: "#8fd4ad",
          300: "#54bb83",
          400: "#2ea165",
          500: "#1a7a4a",
          600: "#14623c",
          700: "#0f4d2f",
          800: "#0a3820",
          900: "#062414",
        },
        blue: {
          500: "#1565c0",
          600: "#0d47a1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
