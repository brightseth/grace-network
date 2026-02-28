/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        grace: {
          bg: '#FAFAF8',
          'bg-alt': '#F3F2EF',
          surface: '#FFFFFF',
          text: '#1A1A1A',
          'text-secondary': '#555555',
          'text-muted': '#888888',
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-wash': '#F5F3FF',
          'purple-dim': '#6D28D9',
          gold: '#D97706',
          border: '#E5E3DE',
          'border-strong': '#D1CFC8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
