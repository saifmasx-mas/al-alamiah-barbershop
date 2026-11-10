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
        // Royal Purple / Violet Palette (from the Pi Network aesthetic)
        royal: {
          950: '#0A0314',
          900: '#110622',
          850: '#180A2F',
          800: '#230E44',
          700: '#351466',
          600: '#581C87',
          500: '#7E22CE',
          400: '#A855F7',
          300: '#C084FC',
        },
        // Metallic Imperial Gold Palette
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          accent: '#FFD700',
        },
      },
      boxShadow: {
        'purple-glow': '0 0 35px -5px rgba(168, 85, 247, 0.35)',
        'gold-glow': '0 0 35px -5px rgba(234, 179, 8, 0.4)',
        'royal-card': '0 20px 50px rgba(10, 3, 20, 0.9), inset 0 1px 1px rgba(250, 204, 21, 0.2)',
      },
    },
  },
  plugins: [],
};
