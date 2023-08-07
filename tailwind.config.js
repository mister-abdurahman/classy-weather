/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["Cinzel Decorative", "sans-serif"],
      },
      backgroundColor: {
        primary: "#eabfb9",
        primary__light: "#f0d2ce",
      },
    },
  },
  plugins: [],
};
