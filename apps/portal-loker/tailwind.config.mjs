/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101010',
        paper: '#f4f3ee',
        paperSoft: '#f9f8f5',
        surface: '#ffffff',
        blue: '#0000ff',
        cobalt: '#1738d1',
        periwinkle: '#c9d0ff',
        lime: '#c8f55b',
        borderMuted: '#d7d6cf',
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
        sans: ['"Inter Tight"', '"Manrope"', '"DM Sans"', 'sans-serif'],
        display: ['"DM Sans"', '"Inter Tight"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        editorial: ['"Instrument Serif"', 'Georgia', 'serif'],
        doodle: ['"Caveat"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px 0 rgba(16, 16, 16, 0.04)',
        'paper-md': '0 4px 16px -2px rgba(16, 16, 16, 0.06)',
        'paper-lg': '0 12px 32px -4px rgba(16, 16, 16, 0.08)',
        'blue-pill': '0 4px 14px rgba(0, 0, 255, 0.25)',
      },
    },
  },
  plugins: [],
}
