/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        match: 'rgb(var(--color-match) / <alpha-value>)',
        gap: 'rgb(var(--color-gap) / <alpha-value>)',
        // Fixed brand navy for the header band, independent of the light/dark
        // toggle: the dark-theme accent is intentionally brighter for visibility
        // against dark surfaces, which would fail contrast with white header text.
        brand: '#35577A',
        'brand-deep': '#28425C',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--color-shadow) / 0.08), 0 4px 16px -4px rgb(var(--color-shadow) / 0.16)',
        softHover: '0 2px 4px rgb(var(--color-shadow) / 0.10), 0 12px 28px -6px rgb(var(--color-shadow) / 0.22)',
        focus: '0 1px 2px rgb(var(--color-shadow) / 0.08), 0 4px 16px -4px rgb(var(--color-accent) / 0.3)',
      },
    },
  },
  plugins: [],
}
