/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        jamb: {
          blue:  "#003B7E",
          green: "#008000",
          light: "#E8F0FE",
        },
      },
    },
  },
  plugins: [],
};

