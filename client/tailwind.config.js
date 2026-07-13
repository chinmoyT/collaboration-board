/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 4px 12px -2px rgb(15 23 42 / 0.08)",
        lift: "0 8px 24px -4px rgb(15 23 42 / 0.12), 0 4px 8px -4px rgb(15 23 42 / 0.08)",
      },
    },
  },
  plugins: [],
}
