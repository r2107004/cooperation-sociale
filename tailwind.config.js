/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", // On le garde au cas où tu utilises src plus tard
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}