import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chalk: '#F5EFE8',
        paper: '#FFFDF9',
        ink: '#211815',
        // Burgundy family — the signature color, now with range
        ledger: '#7A1F2B',
        ledgerdark: '#5C1620',
        ledgerdeep: '#3D0E16',
        ledgerlight: '#9C3444',
        ledgerpale: '#F0DEE0',
        // Warm metallics
        ochre: '#B08D57',
        gold: '#C9A24B',
        goldpale: '#F5EBD8',
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
