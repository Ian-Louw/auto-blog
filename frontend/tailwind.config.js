/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#424143',
        'stone': '#9d9486',
        'gold': '#eac37e',
        'cream': '#e4dac8',
        'sage': '#dde3df',
        'white': '#ffffff',
      },
    },
  },
  plugins: [],
}
