/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'neon-red': '#FF073A',
        'neon-yellow': '#FFD700',
        'neon-blue': '#00D9FF',
        'dark-bg': '#0A0E27',
        'glass-bg': 'rgba(15, 23, 42, 0.7)',
      },
      boxShadow: {
        'neon-green': '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14',
        'neon-red': '0 0 10px #FF073A, 0 0 20px #FF073A, 0 0 30px #FF073A',
        'neon-yellow': '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
