/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          50: '#FFF7FA',
          100: '#F0C0C0',
          200: '#E1B0D5',
          300: '#CFA3D9',
          400: '#AA8FBA',
          500: '#806C97',
          600: '#665278',
          700: '#50385F',
          800: '#351D4C',
          900: '#200040',
          950: '#100030',
        },
        purple: {
          50: '#FFF7FA',
          100: '#F0C0C0',
          200: '#E1B0D5',
          300: '#C080C0',
          400: '#9040C0',
          500: '#6000A0',
          600: '#500080',
          700: '#400070',
          800: '#300060',
          900: '#200040',
          950: '#100030',
        },
        amber: {
          200: '#FFF1CC',
          300: '#F8D878',
          400: '#F0C040',
          500: '#DDAA30',
          600: '#B88420',
          700: '#8F6410',
        },
        yellow: {
          100: '#FFF7DB',
          200: '#FFF1CC',
          300: '#F8D878',
          400: '#F0C040',
          500: '#DDAA30',
          600: '#B88420',
          700: '#8F6410',
        },
        // Deep purple and violet shades from the reference palette
        royal: {
          950: '#100030',
          900: '#200040',
          850: '#200050',
          800: '#300060',
          700: '#400070',
          600: '#500080',
          500: '#6000A0',
          400: '#9040C0',
          300: '#C080C0',
        },
        // Warm gold accent shades from the reference palette
        gold: {
          300: '#F8D878',
          400: '#F0C040',
          500: '#DDAA30',
          600: '#B88420',
          700: '#8F6410',
          accent: '#F0C040',
        },
      },
      boxShadow: {
        'purple-glow': '0 0 35px -5px rgba(144, 64, 192, 0.35)',
        'gold-glow': '0 0 35px -5px rgba(240, 192, 64, 0.4)',
        'royal-card': '0 20px 50px rgba(16, 0, 48, 0.9), inset 0 1px 1px rgba(240, 192, 64, 0.2)',
      },
    },
  },
  plugins: [],
};
