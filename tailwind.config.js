export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#14213D',
          50: '#EEF1F7',
          100: '#D9DFEB',
          300: '#8E9BB8',
          500: '#3B4E78',
          600: '#2A3B5F',
          700: '#1E2D4D',
          800: '#182644',
          900: '#0E1830',
        },
        primary: { DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)', hover: 'rgb(var(--color-primary-hover) / <alpha-value>)', soft: 'rgb(var(--color-primary-soft) / <alpha-value>)', line: 'rgb(var(--color-primary-line) / <alpha-value>)' },
        teal: { DEFAULT: 'rgb(var(--color-teal) / <alpha-value>)', dark: 'rgb(var(--color-teal-dark) / <alpha-value>)', soft: 'rgb(var(--color-teal-soft) / <alpha-value>)', line: 'rgb(var(--color-teal-line) / <alpha-value>)' },
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        hover: 'rgb(var(--color-hover) / <alpha-value>)',
        success: { DEFAULT: 'rgb(var(--color-success) / <alpha-value>)', soft: 'rgb(var(--color-success-soft) / <alpha-value>)', line: 'rgb(var(--color-success-line) / <alpha-value>)' },
        warning: { DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)', fill: 'rgb(var(--color-warning-fill) / <alpha-value>)', soft: 'rgb(var(--color-warning-soft) / <alpha-value>)', line: 'rgb(var(--color-warning-line) / <alpha-value>)' },
        danger: { DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)', dark: 'rgb(var(--color-danger-dark) / <alpha-value>)', soft: 'rgb(var(--color-danger-soft) / <alpha-value>)', line: 'rgb(var(--color-danger-line) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--color-info) / <alpha-value>)', soft: 'rgb(var(--color-info-soft) / <alpha-value>)', line: 'rgb(var(--color-info-line) / <alpha-value>)' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        pop: '0 12px 32px -12px rgba(15,23,42,0.28)',
        frame: '0 30px 60px -30px rgba(15,23,42,0.40)',
      },
    },
  },
};
