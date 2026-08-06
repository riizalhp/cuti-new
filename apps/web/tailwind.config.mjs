/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        surface: '#FFFFFF',
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
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          medium: 'rgba(255, 255, 255, 0.85)',
          heavy: 'rgba(255, 255, 255, 0.95)',
        },
        status: {
          success: '#22C55E',
          warning: '#EAB308',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Instrument Serif"', '"Bodoni Moda"', 'Geist', 'Inter', 'sans-serif'],
        editorial: ['"Instrument Serif"', '"Bodoni Moda"', '"Cormorant Garamond"', 'Didot', 'serif'],
        serif: ['"Instrument Serif"', '"Bodoni Moda"', '"Cormorant Garamond"', 'Didot', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(31, 53, 120, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 12px 30px -4px rgba(31, 53, 120, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'cta': '0 10px 25px -5px rgba(249, 115, 22, 0.4), 0 4px 6px -2px rgba(249, 115, 22, 0.1)',
        'cta-hover': '0 15px 30px -5px rgba(249, 115, 22, 0.5), 0 6px 10px -2px rgba(249, 115, 22, 0.2)',
        'glass-lg': '0 20px 25px -5px rgba(31, 53, 120, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'blur-in': 'blurIn 400ms ease-out',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 400ms ease-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

