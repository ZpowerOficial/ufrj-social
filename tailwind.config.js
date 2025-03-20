/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'ufrj-blue': '#003366',
          'ufrj-light-blue': '#0066cc',
        }
      },
    },
    plugins: [],
  }