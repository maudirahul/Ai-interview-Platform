/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: '#0a0f0d',
        surface: '#111a14',
        surface2: '#162019',
        green: {
          DEFAULT: '#4ade80',
          dim: '#22c55e',
          muted: 'rgba(74,222,128,0.1)',
        },
        muted: '#8a9e8e',
        dim: '#4a5e4e',
      },
    },
  },
  plugins: [],
}