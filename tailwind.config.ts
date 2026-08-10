import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spatial: {
          bg: '#0b0f19',
          panel: 'rgba(18, 24, 38, 0.85)',
          accent: '#00f3ff',
          purple: '#7000ff',
          amber: '#ffaa00',
          border: 'rgba(0, 243, 255, 0.2)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
