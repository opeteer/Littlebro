/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hud-bg': '#080b11',
        'hud-border': '#1a2235',
        'hud-accent': '#00ffcc',
        'hud-alert': '#ff3333',
        'hud-warn': '#ffcc00'
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
