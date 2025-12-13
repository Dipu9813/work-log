module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec4899', // pink-500
          light: '#f9a8d4',  // pink-300
          dark: '#be185d',   // pink-700
        },
        background: {
          DEFAULT: '#000',
        },
      },
    },
  },
  plugins: [],
}
