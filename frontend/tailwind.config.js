/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          850: '#121a2e',
          900: '#0c1222',
          950: '#070b14',
        },
        accent: {
          DEFAULT: '#0d9488',
          light: '#14b8a6',
          dark: '#0f766e',
          muted: '#ecfdf5',
        },
        surface: {
          DEFAULT: '#f4f6f9',
          warm: '#faf9f7',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgb(12 18 34 / 0.04), 0 8px 24px rgb(12 18 34 / 0.06)',
        elevated: '0 4px 6px rgb(12 18 34 / 0.04), 0 20px 40px rgb(12 18 34 / 0.08)',
        sidebar: '4px 0 24px rgb(12 18 34 / 0.06)',
        glow: '0 0 0 1px rgb(13 148 136 / 0.1), 0 8px 32px rgb(13 148 136 / 0.15)',
        'inner-soft': 'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, #0c1222 0%, #121a2e 45%, #0f766e 100%)',
        'accent-gradient': 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        'page-mesh':
          'radial-gradient(at 0% 0%, rgb(13 148 136 / 0.06) 0, transparent 50%), radial-gradient(at 100% 0%, rgb(12 18 34 / 0.04) 0, transparent 40%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
