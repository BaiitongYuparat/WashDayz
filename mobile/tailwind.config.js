/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}" , "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        blue: {
          main: "#00ACC3",
          second: "#01CCE6",
          light: "#90ECF9",
        }
      },
      borderColor: {
        blue: {
          main: "#00ACC3",
        }
      }
    },
  },
  plugins: [],
}

