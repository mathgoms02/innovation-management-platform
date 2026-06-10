/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0b0c10',
          secondary: '#1d202b',
        },
        brand: {
          primary: '#00f0ff',
          secondary: '#ff007a',
        },
      },
      borderRadius: {
        'custom': '10px',
      },
      transitionDuration: {
        'fast': '200ms',
        'medium': '500ms',
      }
    },
  },
  plugins: [],
}

