/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'ibm-plex-mono': ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        'satoshi': ['Satoshi', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'metrics': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'data': ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        'heading': ['Satoshi', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Accent colors for metrics and status
        'velocity-blue': '#3b82f6',
        'insight-cyan': '#06b6d4',
        'efficiency-green': '#10b981',
        'warning-amber': '#f59e0b',
        'alert-red': '#ef4444',

        // Neutrals for data density
        'neutral-50': '#f8fafc',
        'neutral-100': '#f1f5f9',
        'neutral-200': '#e2e8f0',
        'neutral-300': '#cbd5e1',
        'neutral-400': '#94a3b8',
        'neutral-500': '#64748b',
        'neutral-600': '#475569',
        'neutral-700': '#334155',
        'neutral-800': '#1e293b',
        'neutral-900': '#0f172a',
        'neutral-950': '#020617',
      },
      keyframes: {
        'metric-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' }
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(100%)', opacity: '0' }
        },
        'insight-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(6, 182, 212, 0.3)' }
        }
      },
      animation: {
        'metric-pulse': 'metric-pulse 3s ease-in-out infinite',
        'data-flow': 'data-flow 2s linear infinite',
        'insight-glow': 'insight-glow 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}