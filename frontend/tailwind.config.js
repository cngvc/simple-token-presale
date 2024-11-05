/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        'open-san': ['Open Sans', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif']
      },
      screens: {
        edge: '90rem'
      },
      colors: {
        black: 'rgb(var(--color-black))',
        primary: 'rgb(var(--color-primary))',
        leon: 'rgb(var(--color-leon))',
        placeholder: 'rgb(var(--color-placeholder))',
        'dark-primary': 'rgb(var(--color-dark-primary))',
        'light-primary': 'rgb(var(--color-light-primary))',
        'darker-primary': 'rgb(var(--color-darker-primary))',
        'darkest-primary': 'rgb(var(--color-darkest-primary))'
      },
      maxWidth: {
        figma: '90rem'
      }
    }
  },
  plugins: [require('tailwind-scrollbar'), require('tailwindcss-animated')]
}
