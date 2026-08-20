/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3eeff',
          100: '#e6d6ff',
          200: '#d1adff',
          500: '#7a35ff', // Signal Violet
          600: '#6825e6',
          700: '#5518cc',
        },
        mist: {
          50: '#f8fafc',
          100: '#f0f2f5', // Mist Gray
          200: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'violet': '0 10px 25px -3px rgba(122, 53, 255, 0.15), 0 4px 6px -4px rgba(122, 53, 255, 0.05)',
        'violet-sm': '0 2px 10px -2px rgba(122, 53, 255, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
}
