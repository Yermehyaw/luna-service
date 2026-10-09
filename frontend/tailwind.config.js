/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luna: {
          // Intelligence (Deep Dark Purple - Brand Primary & Texts)
          purple: {
            DEFAULT: '#291E29',
            950: '#1F171F',
            900: '#291E29',
            850: '#341539',
            800: '#52215A',
            700: '#702D7B',
            600: '#8E399C',
            500: '#AB47BB',
            400: '#BA68D7',
            300: '#C989D4',
            200: '#D8AAE0',
            100: '#EBD2F0',
            50: '#F7EDFA',
          },
          // Warmth (Warm Cream - Main Backgrounds & Warmth)
          cream: {
            DEFAULT: '#FFF6E9',
            50: '#FCFBF4',
            100: '#FFF6E9',
            200: '#FFF0D9',
            300: '#FFE5C2',
            400: '#FFD9A8',
          },
          // Energy (Tangerine - CTAs, Buttons & Interactive Sparks)
          tangerine: {
            DEFAULT: '#FFA800',
            600: '#E69700',
            500: '#FFA800',
            400: '#FFB11A',
            300: '#FFC24D',
            200: '#FFDC99',
            100: '#FFE5B3',
            50: '#FFF6E5',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Allen Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Meigan', 'Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
