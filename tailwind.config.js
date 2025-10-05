/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ZUS Colors - flat structure for easier usage
        'zus-green': '#00A651',           // Główny zielony ZUS
        'zus-green-primary': '#00A651',   // Główny zielony ZUS
        'zus-green-secondary': '#008A43', // Ciemniejszy zielony
        'zus-green-light': '#33B86B',     // Jaśniejszy zielony
        'zus-green-pale': '#E8F5ED',      // Bardzo jasny zielony
        'zus-navy': '#1E3A8A',            // Granatowy
        'zus-gray-900': '#111827',        // Ciemny szary
        'zus-gray-600': '#4B5563',        // Średni szary
        'zus-gray-300': '#D1D5DB',        // Jasny szary
        'zus-gray-200': '#E5E7EB',        // Jasny szary
        'zus-gray-100': '#F3F4F6',        // Bardzo jasny szary
        'zus-gray-50': '#F9FAFB',         // Najjaśniejszy szary
        'zus-orange': '#F59E0B',          // Pomarańczowy
        'zus-red': '#DC2626',             // Czerwony
        'zus-blue': '#3B82F6',            // Niebieski
        
        // Keep nested structure for compatibility
        zus: {
          green: {
            primary: '#00A651',
            dark: '#008A43',
            light: '#33B86B',
            pale: '#E8F5ED',
          },
          navy: '#1E3A8A',
          gray: {
            900: '#111827',
            600: '#4B5563',
            300: '#D1D5DB',
            200: '#E5E7EB',
            100: '#F3F4F6',
            50: '#F9FAFB',
          },
          orange: '#F59E0B',
          red: '#DC2626',
          blue: '#3B82F6',
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