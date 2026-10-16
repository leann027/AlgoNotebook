/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'paper-base': 'var(--paper-base)',
        'paper-surface': 'var(--paper-surface)',
        'paper-border': 'var(--paper-border)',
        'paper-grid': 'var(--paper-grid)',
        'ink-primary': 'var(--ink-primary)',
        'ink-secondary': 'var(--ink-secondary)',
        'ink-muted': 'var(--ink-muted)',
        'highlighter-compare': 'var(--highlighter-compare)',
        'highlighter-swap': 'var(--highlighter-swap)',
        'highlighter-success': 'var(--highlighter-success)',
        'highlighter-pointer': 'var(--highlighter-pointer)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'body-md': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        code: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        modalScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fadeOut 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-in': 'modalScaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
