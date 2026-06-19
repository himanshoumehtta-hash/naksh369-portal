/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: '#0A0612',
          900: '#110D1E',
          800: '#1A1430',
          700: '#261D45',
        },
        gold: {
          300: '#F0D080',
          400: '#E8C055',
          500: '#D4A820',
          600: '#B8900A',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #261D45 0%, #0A0612 70%)',
        'gold-shimmer': 'linear-gradient(135deg, #D4A820 0%, #F0D080 50%, #D4A820 100%)',
      },
    },
  },
  plugins: [],
};
