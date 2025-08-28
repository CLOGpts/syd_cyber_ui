
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6', // blue-500
          DEFAULT: '#2563eb', // blue-600
          dark: '#1d4ed8', // blue-700
        },
        header: {
          light: '#1e3a8a', // blue-800
          dark: '#1e293b', // slate-800
        },
        background: {
          light: '#f1f5f9', // slate-100
          dark: '#0f172a', // slate-900
        },
        card: {
          light: '#ffffff',
          dark: '#1e293b', // slate-800
        },
        text: {
          light: '#1e293b', // slate-800
          dark: '#e2e8f0', // slate-200
        },
        'text-muted': {
          light: '#64748b', // slate-500
          dark: '#94a3b8', // slate-400
        }
      }
    },
  },
  plugins: [],
}
