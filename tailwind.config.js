/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          light: '#f0d9b5',
          dark: '#b58863',
          accent: 'rgba(255, 255, 0, 0.4)',
          lastMove: 'rgba(172, 206, 103, 0.5)'
        }
      }
    },
  },
  plugins: [],
}