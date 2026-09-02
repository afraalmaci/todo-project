/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // Calm, pastel palette: one muted sage accent for actions/progress,
        // a handful of soft pastel hues for tag chips, and warm neutral grays
        // for everything else. Nothing fully saturated - Notion/Things-like.
        sage: {
          50: '#eef6f2',
          100: '#dcece4',
          200: '#bfe3d4',
          300: '#a3d3bf',
          400: '#7fb8a3',
          500: '#5a9c85',
          600: '#47816d',
          700: '#3a6b5a',
        },
        rose: {
          50: '#fbeef2',
          100: '#f6dde5',
          200: '#eec0cd',
          300: '#dea0b3',
          400: '#c17a8f',
          500: '#a85e75',
        },
        lavender: {
          50: '#efedfb',
          100: '#e0dcf7',
          200: '#c7bfef',
          300: '#a99ce3',
          400: '#8177c9',
          500: '#6b5fb5',
        },
        peach: {
          50: '#fbf0e6',
          100: '#f6e0c9',
          200: '#eec69c',
          300: '#dda672',
          400: '#c98a5c',
          500: '#ab6f45',
        },
        sky: {
          50: '#eaf3f9',
          100: '#d5e7f3',
          200: '#aed0e7',
          300: '#7fb3d6',
          400: '#5a93b8',
          500: '#43759a',
        },
        mist: '#f6f8f6',
        ink: '#2b2f2d',
        muted: '#8b938f',
        faint: '#a7afab',
        ghost: '#c6cbc6',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 36, 32, 0.04), 0 8px 24px rgba(31, 36, 32, 0.05)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.97) translateY(4px)', opacity: 0 },
          '100%': { transform: 'scale(1) translateY(0)', opacity: 1 },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        pop: 'pop 0.18s ease-out',
        floaty: 'floaty 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
