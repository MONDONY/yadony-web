import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
        },
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
          deep: 'rgb(var(--navy-deep) / <alpha-value>)',
        },
        orange: {
          DEFAULT: 'rgb(var(--orange) / <alpha-value>)',
          hover: 'rgb(var(--orange-hover) / <alpha-value>)',
          deep: 'rgb(var(--orange-deep) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        sand: {
          DEFAULT: 'rgb(var(--sand) / <alpha-value>)',
          deep: 'rgb(var(--sand-deep) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: { card: '18px', el: '12px' },
      maxWidth: { content: '1200px', prose: '68ch' },
    },
  },
  plugins: [],
} satisfies Config
