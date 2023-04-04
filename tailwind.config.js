/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'bt': '0 15px 50px -15px rgba(0, 0, 0, 0.5)',
        'dual': '5px 5px 0 0 rgba(0, 0, 0, 0.7)',
        'darkbox': '1px 1px 2px rgba(255,255,255,0.05)',
        'neumreverse': 'inset 6px 6px 12px #1d1d1f, inset -6px -6px 12px #313135'
      },
      fontFamily: {
        'noto': ['Noto Sans KR', 'sans-serif']
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
