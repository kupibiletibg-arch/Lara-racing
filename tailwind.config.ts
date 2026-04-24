import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use RGB channel vars so Tailwind's `bg-bg/70` opacity modifier
        // actually compiles (it needs to split the color into channels to
        // apply the alpha). The legacy hex vars in :root are kept for
        // components that still use them directly.
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        line: 'rgb(var(--ink-rgb) / <alpha-value>)',
        brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
        'brand-deep': 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
        data: 'rgb(var(--data-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        mono: '0.04em',
      },
    },
  },
  plugins: [],
}
export default config
