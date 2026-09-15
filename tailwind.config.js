/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#08080a',
          850: '#0d0d10',
          800: '#121216',
          750: '#17171c',
          700: '#1d1d23',
          600: '#26262e',
          500: '#33333d',
        },
        hair: 'rgba(255,255,255,0.08)',
        hairStrong: 'rgba(255,255,255,0.14)',
        flame: {
          DEFAULT: '#ff7a1a',
          soft: '#ffa24d',
          deep: '#e2590a',
        },
        good: '#32d583',
        warn: '#fdb022',
        bad: '#f97066',
        pillar: {
          codeforces: '#5b9cff',
          system: '#a78bfa',
          gym: '#f97066',
          chess: '#e8eaed',
          instagram: '#ff5c8a',
          mind: '#4fd1c5',
          money: '#32d583',
          reading: '#fdb022',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'Segoe UI Variable Display',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        num: [
          'SF Pro Display',
          '-apple-system',
          'Segoe UI Variable Display',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      borderRadius: {
        sheet: '1.75rem',
        card: '1.25rem',
      },
      transitionTimingFunction: {
        // Apple's sheet / modal curve
        sheet: 'cubic-bezier(0.32, 0.72, 0, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        safeTop: 'env(safe-area-inset-top, 0px)',
        safeBottom: 'env(safe-area-inset-bottom, 0px)',
      },
      maxWidth: {
        shell: '480px',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        flamePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.88' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        flamePulse: 'flamePulse 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
