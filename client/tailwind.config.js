export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e11d48', // rose-600 (Coral Red)
          dark: '#be123c',    // rose-700
          light: '#fb7185'    // rose-400
        },
        indigo: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48', // rose-600
          700: '#be123c', // rose-700
          800: '#9f1239', // rose-800
          900: '#881337', // rose-900
          950: '#4c0519'  // rose-950
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
