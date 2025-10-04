/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zus: {
          orange: 'rgb(255, 179, 79)',
          green: 'rgb(0, 153, 63)',
          blue: 'rgb(63, 132, 210)',
          gray: 'rgb(190, 195, 206)',
          navy: 'rgb(0, 65, 110)',
          red: 'rgb(240, 94, 94)',
          black: 'rgb(0, 0, 0)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}