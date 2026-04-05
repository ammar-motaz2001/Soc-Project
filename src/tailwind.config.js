/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0F1722',
        bg2: '#151C26',
        card: '#19232C',
        muted: '#98A0AC',
        text: '#E6EEF6',
        accent: '#A7EA3B',
        'accent-2': '#64D16C',
        danger: '#FF6B6B',
      },
    },
  },
  plugins: [],
}
