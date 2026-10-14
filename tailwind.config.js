/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'paper-base': '#FDFBF7',
        'paper-surface': '#FFFFFF',
        'paper-border': '#E5E0D8',
        'paper-grid': '#EAE5DC',
        'ink-primary': '#1E232A',
        'ink-secondary': '#5C6470',
        'ink-muted': '#9DA4B0',
        'highlighter-compare': '#FEF08A',
        'highlighter-swap': '#FFD7BA',
        'highlighter-success': '#BBF7D0',
        'highlighter-pointer': '#E9D5FF',
        'surface-container-low': '#F5F3EF',
        'surface-container': '#EFEEEA',
        'surface-container-high': '#EAE8E4',
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
    },
  },
  plugins: [],
}
