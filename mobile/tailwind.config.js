/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}" , "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: {
          main: "#00ACC3",
          light: "#90ECF9",
        }
      }
    },
  },
  plugins: [],
}

