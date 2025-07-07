import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-color': 'var(--bg-color)',
        'text-color': 'var(--text-color)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        'primary-color': 'var(--primary-color)',
        'secondary-color': 'var(--secondary-color)',
        'accent-color': 'var(--accent-color)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'danger-color': 'var(--danger-color)',
        'shadow': 'var(--shadow)',
        'shadow-lg': 'var(--shadow-lg)',
        'note-bg': 'var(--note-bg)',
        'grid-color': 'var(--grid-color)',
        'header-bg': 'var(--header-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'input-focus': 'var(--input-focus)',
        'modal-bg': 'var(--modal-bg)',
        'modal-overlay': 'var(--modal-overlay)',
        'button-hover': 'var(--button-hover)',
        'code-bg': 'var(--code-bg)',
        'code-border': 'var(--code-border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionTimingFunction: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
        'bounce': 'var(--bounce)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' },
        },
        bounce: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-30px,0)' },
          '70%': { transform: 'translate3d(0,-15px,0)' },
          '90%': { transform: 'translate3d(0,-4px,0)' },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'bounce-in': 'bounce 0.8s ease-out',
        'pulse': 'pulse 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};

export default config;