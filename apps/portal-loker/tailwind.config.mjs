/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101114',
        paper: '#f5f6f2',
        cobalt: '#1738d1',
        periwinkle: '#c9d0ff',
        lime: '#c8f55b',
        navy: {
          900: '#0F1A3C',
          800: '#162758',
          700: '#1F3578',
          600: '#2A469A',
          500: '#3B5CC4',
          200: '#C7D2FE',
          100: '#EBF0FF',
        },
        orange: {
          600: '#EA580C',
          500: '#F97316',
          400: '#FB923C',
          200: '#FED7AA',
          100: '#FFEDD5',
        },
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'sans-serif'],
        display: ['"Instrument Serif"', '"Bodoni Moda"', 'Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Bodoni Moda"', '"Cormorant Garamond"', 'serif'],
        doodle: ['"Caveat"', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
