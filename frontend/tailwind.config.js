/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4ade80',
          hover: '#22c55e'
        },
        dark: {
          DEFAULT: '#121212',
          card: '#181818',
          lighter: '#282828'
        }
      },
      backgroundColor: {
        'card-hover': 'rgba(38, 38, 38, 0.95)'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #C5A572 0%, #E5C992 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}