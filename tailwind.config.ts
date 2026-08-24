import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chalk: '#F7F3EC',
        paper: '#FFFDF9',
        ink: '#211815',
        ledger: '#7A1F2B',
        ledgerdark: '#5C1620',
        ochre: '#B08D57',
        gold: '#C9A24B',
        rust: '#8B5A2B',
        slate: '#DCD3C4',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '2px',
        md: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
