/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aef8',
          500: '#0c92e7',
          600: '#0274c7',
          700: '#035ca3',
          800: '#074e86',
          900: '#0c416f',
          950: '#082949',
        },
        navy: {
          800: '#0f172a',
          900: '#0b0f19',
          950: '#05070d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        signature: ['"Caveat"', '"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
