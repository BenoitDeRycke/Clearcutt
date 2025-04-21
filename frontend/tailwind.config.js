export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './src/utils/**/*.{js,ts}'],
  safelist: ['text-red-600', 'text-orange-500', 'text-emerald-600', 'text-purple-600'],

  theme: {
    extend: {
      animation: {
        'fade-in-down': 'fadeInDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
