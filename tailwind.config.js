/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          blue: '#2563eb',
          'blue-light': '#eff6ff',
          'blue-soft': '#dbeafe',
        },
        detection: {
          distraction: '#ef4444',
          'distraction-light': '#fee2e2',
          drowsiness: '#f59e0b',
          'drowsiness-light': '#fef3c7',
          phone: '#8b5cf6',
          'phone-light': '#ede9fe',
          other: '#94a3b8',
          'other-light': '#f1f5f9',
          clean: '#10b981',
          'clean-light': '#d1fae5',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
