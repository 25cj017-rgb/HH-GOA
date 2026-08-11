/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#0F2E1E', // Main page and dark badge bg
          900: '#143C27',
          800: '#1A4F33',
        },
        tropical: {
          yellow: '#FFDD00', // Primary yellow buttons, borders, highlights
          pink: '#E91E63',   // Hot pink/magenta accents
          cream: '#FDFBF7',  // Off-white/sand color for cards
        }
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['monospace'],
      }
    },
  },
  plugins: [],
}
