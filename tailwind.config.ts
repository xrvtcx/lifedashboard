import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chalk: '#EEF0EC',
        paper: '#F7F8F5',
        ink: '#15211D',
        ledger: '#2F5D50',
        ledgerdark: '#20443A',
        ochre: '#C08A2E',
        rust: '#9C3D2E',
        slate: '#C9CDC7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
