/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        ink: '#000000',
        muted: '#6F6F6F',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.8s ease-out both',
        'fade-rise-delay': 'fade-rise 0.8s ease-out 0.2s both',
        'fade-rise-delay-2': 'fade-rise 0.8s ease-out 0.4s both',
      },
    },
  },
  plugins: [],
}
