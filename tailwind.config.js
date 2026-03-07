/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vinculamos las clases de Tailwind a variables CSS
        primary: "var(--primary)",
        "background-light": "var(--background-light)",
        "background-dark": "var(--background-dark)",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "3.5rem",
        "3xl": "4rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}