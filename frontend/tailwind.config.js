/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ios-red': '#ff453a',
        'ios-green': '#30d158',
        'ios-blue': '#0a84ff',
        'ios-yellow': '#ffd60a',
        'ios-indigo': '#636bff',
        'ios-card': '#1c1c1e',
        'ios-bg': '#0f0f0f',
        'ios-secondary': '#8e8e93',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
