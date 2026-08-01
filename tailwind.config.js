/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f6',
          100: '#d6f0e8',
          200: '#aee1d1',
          300: '#7dccb6',
          400: '#52b89e',
          500: '#2f9d84',
          600: '#22826d',
          700: '#1c6858',
          800: '#19544a',
          900: '#16453d',
        },
        ink: {
          900: '#0f1b2d',
          800: '#16263b',
        },
        surface: '#eef3f1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
