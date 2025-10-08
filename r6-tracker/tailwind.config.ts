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
        // Couleurs principales R6
        r6: {
          primary: '#ff3d2c',
          secondary: '#0c0f16',
          accent: '#ffd23f',
          dark: '#0c0f16',
          'dark-secondary': '#1a1d26',
          light: '#f8f9fa',
        },
        
        // Glassmorphism colors
        glass: {
          bg: 'rgba(255, 255, 255, 0.15)',
          'bg-strong': 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.3)',
          'bg-dark': 'rgba(12, 15, 22, 0.15)',
          'bg-dark-strong': 'rgba(12, 15, 22, 0.25)',
          'border-dark': 'rgba(12, 15, 22, 0.3)',
        },
        
        // Couleurs de rang
        rank: {
          unranked: '#6c757d',
          copper: '#cd7f32',
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          platinum: '#e5e4e2',
          diamond: '#b9f2ff',
          champion: '#ff6b6b',
        }
      },
      
      backdropBlur: {
        'glass': '20px',
      },
      
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'r6-glow': '0 0 20px rgba(255, 61, 44, 0.3)',
        'accent-glow': '0 0 20px rgba(255, 210, 63, 0.3)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 61, 44, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 61, 44, 0.6)' },
        },
      },
      
      fontFamily: {
        'r6': ['system-ui', 'sans-serif'],
      },
      
      backgroundImage: {
        'gradient-r6': 'linear-gradient(135deg, #ff3d2c 0%, #ffd23f 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0c0f16 0%, #1a1d26 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

export default config;