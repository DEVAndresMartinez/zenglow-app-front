// tailwind.config.js
// NOTA: Tailwind v4 usa configuración CSS-first vía @theme en src/tailwind.css.
// Este archivo es ignorado a menos que se referencie con @config en el CSS.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
