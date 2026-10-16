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
          press: 'rgb(var(--primary-press) / <alpha-value>)',
          soft: 'rgb(var(--primary-soft) / <alpha-value>)',
        },
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
          deep: 'rgb(var(--navy-deep) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          strong: 'rgb(var(--accent-strong) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          text: 'rgb(var(--accent-text) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        sand: {
          DEFAULT: 'rgb(var(--sand) / <alpha-value>)',
          deep: 'rgb(var(--sand-deep) / <alpha-value>)',
        },
        bg: 'rgb(var(--bg) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
        invite: {
          DEFAULT: 'rgb(var(--invite) / <alpha-value>)',
          soft: 'rgb(var(--invite-soft) / <alpha-value>)',
        },
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
      // DonyRadius : cartes 16, boutons 14, champs 12, pastilles 20,
      // feuilles 24. `el` reste l'alias historique des petits éléments.
      borderRadius: { card: '16px', btn: '14px', field: '12px', el: '12px', pill: '20px', sheet: '24px' },
      // DonyShadow : ombres à l'encre #0A2540, ombre bleue sous les boutons pleins.
      boxShadow: {
        xs: '0 1px 2px rgb(10 37 64 / 0.04)',
        sm: '0 2px 8px rgb(10 37 64 / 0.06), 0 1px 2px rgb(10 37 64 / 0.04)',
        md: '0 8px 20px rgb(10 37 64 / 0.08), 0 2px 4px rgb(10 37 64 / 0.04)',
        lg: '0 12px 32px rgb(10 37 64 / 0.12)',
        xl: '0 24px 48px rgb(10 37 64 / 0.16)',
        brand: '0 8px 24px rgb(11 95 255 / 0.24), 0 2px 8px rgb(11 95 255 / 0.1)',
        accent: '0 6px 18px rgb(217 106 58 / 0.22)',
      },
      // DonyDuration / DonyCurve.
      transitionDuration: { micro: '150ms', base: '220ms', slow: '320ms', page: '480ms' },
      transitionTimingFunction: { dony: 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'dony-in-out': 'cubic-bezier(0.5, 0, 0.2, 1)' },
      maxWidth: { content: '1200px', prose: '68ch' },
    },
  },
  plugins: [],
} satisfies Config
