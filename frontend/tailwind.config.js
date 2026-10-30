/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F4F9F4',
          100: '#E6F3E6',
          200: '#C7E4C7',
          300: '#9ECD9E',
          400: '#69B069',
          500: '#3D933D',
          600: '#2D752D',
          700: '#235D23',
          800: '#1B4A1B',
          900: '#133713',
          950: '#0B220B',
        },
        forest: {
          800: '#143D28',
          900: '#0F2F1F',
          950: '#0A1E14',
        },
        earth: {
          100: '#F7F3EE',
          200: '#EBE2D5',
          300: '#D5C3AB',
          600: '#8C6D46',
          800: '#5A4226',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
