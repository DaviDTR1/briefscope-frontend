/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#141414',
        card:    '#1c1c1c',
        hover:   '#222222',
        surface: '#262626',
        border:  { DEFAULT: '#2a2a2a', subtle: '#222222' },
        text:    { DEFAULT: '#ededeb', muted: '#8a8a87', dim: '#585856' },
        accent:  { DEFAULT: '#e8180c', soft: 'rgba(232,24,12,0.08)' },
        ok:      '#22c55e',
        warn:    '#d4a056',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        queai: '10px',
        sm:    '7px',
      },
      fontSize: {
        base: ['15px', '1.6'],
      },
    },
  },
  plugins: [],
}
