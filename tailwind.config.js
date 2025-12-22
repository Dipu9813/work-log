export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D91A7A',
          light: '#F06292',
          dark: '#C5197D',
        },
        secondary: {
          orange: '#F26522',
          teal: '#00BFE8',
          green: '#56C02B',
          yellow: '#FCC30B',
        },
        accent: {
          pink: '#E91E63',
          magenta: '#C5197D',
        },
        background: {
          DEFAULT: '#FFF',
          subtle: '#FDF5F8',
        },
      },
      backgroundImage: {
        'gradient-hult': 'linear-gradient(135deg, #C5197D 0%, #D91A7A 50%, #E91E63 100%)',
        'gradient-card': 'linear-gradient(to bottom right, #FDF5F8, #FFFFFF)',
      },
    },
  },
  plugins: [],
}
