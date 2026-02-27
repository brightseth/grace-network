/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vibe: {
          black: '#13120F',
          dark: '#1C1B17',
          card: '#232218',
          border: '#333025',
          gold: '#C8B080',
          'gold-dim': '#9A8A68',
          green: '#80B080',
          'green-dim': '#5A8A5A',
          cream: '#E8E0D0',
          muted: '#8A8578',
          warm: '#F5F0E8',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
