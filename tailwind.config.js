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
        primary: { DEFAULT: '#2563EB', hover: '#1D4ED8', soft: '#EFF4FF', line: '#BFD3FE' },
        teal: { DEFAULT: '#0D9488', dark: '#0F766E', soft: '#E6F6F4', line: '#99DED6' },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        ink: '#0F172A',
        muted: '#64748B',
        subtle: '#94A3B8',
        line: '#E2E8F0',
        hover: '#F1F5F9',
        success: { DEFAULT: '#15803D', soft: '#ECFDF3', line: '#BBF7D0' },
        warning: { DEFAULT: '#B45309', fill: '#D97706', soft: '#FFF7ED', line: '#FED7AA' },
        danger: { DEFAULT: '#DC2626', dark: '#B91C1C', soft: '#FEF2F2', line: '#FECACA' },
        info: { DEFAULT: '#0369A1', soft: '#F0F9FF', line: '#BAE6FD' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        pop: '0 12px 32px -12px rgba(15,23,42,0.28)',
        frame: '0 30px 60px -30px rgba(15,23,42,0.40)',
      },
    },
  },
};
