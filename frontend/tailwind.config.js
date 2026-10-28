/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d2',
          300: '#86efae',
          400: '#4ade82',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#14532d',
          850: '#0f3f22',
          900: '#0b2e19',
          950: '#051b0e',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        sage: {
          50: '#f6f8f7',
          100: '#eef2f0',
          200: '#dde5e1',
          300: '#c2d1cb',
          400: '#9fb5ac',
          500: '#7e988e',
          600: '#637b72',
          700: '#50635c',
          800: '#42514c',
          900: '#38433f',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(11, 46, 25, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 25px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}

