/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1B3D',
          light: '#1C2E5A',
        },
        teal: {
          DEFAULT: '#2EC4B6',
          light: '#6EE7C8',
        },
        aqua: '#3ABEFF',
        card: '#E4E7EC',
        background: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}