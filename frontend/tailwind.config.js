/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      boxShadow: {
        'glow':    '0 0 24px rgba(99,102,241,0.18)',
        'glow-lg': '0 0 40px rgba(99,102,241,0.22)',
      },
      animation: {
        blob: 'blob 8s infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(20px,-30px) scale(1.08)' },
          '66%':     { transform: 'translate(-15px,15px) scale(0.94)' },
        },
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
