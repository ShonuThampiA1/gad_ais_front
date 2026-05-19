const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  darkMode: 'class', // Use class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--theme-font-family, Inter)', 'sans-serif', { fontFeatureSettings: '"cv11"' }],
      },
      colors: {
        primary: {
          500: 'var(--theme-primary-color, #1e40af)',
          600: 'var(--theme-primary-color, #2563eb)',
          700: 'var(--theme-primary-color, #1d4ed8)',
        }
      },
      borderRadius: {
        theme: 'var(--theme-border-radius, 0.5rem)',
      },
      borderWidth: {
        theme: 'var(--theme-border-width, 1px)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
/** @type {import('tailwindcss').Config} */
module.exports = config


