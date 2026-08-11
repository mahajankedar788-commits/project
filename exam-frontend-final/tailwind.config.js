/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1F33',       // deep navy — primary surface/text
        navy: {
          DEFAULT: '#0F2942',
          700: '#16324F',
          600: '#1D3E5E',
        },
        teal: {
          DEFAULT: '#14B8A6',
          light: '#5EEAD4',
          dark: '#0D9488',
        },
        parchment: '#F6F5F1', // warm off-white background
        slate: {
          925: '#0A1826',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 40px -18px rgba(11, 31, 51, 0.35)',
      },
    },
  },
  plugins: [],
};
