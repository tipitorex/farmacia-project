/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f5",
          100: "#cfe9e3",
          500: "#1f7a6b",
          700: "#17594e"
        }
      }
    },
  },
  plugins: [],
};
