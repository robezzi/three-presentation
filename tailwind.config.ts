// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        slideInFromLeft: 'slideInFromLeft 2s ease-out forwards',
        slideInFromBottom: 'slideInFromBottom 1s ease-out forwards',
        slideLinks: 'slideLinks 2s ease-out forwards',
        dragBounce: 'dragBounce 1.3s ease-in-out infinite',
      },
      keyframes: {
        slideInFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0%)' },
        },
        slideInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(200%)' },
          '100%': { opacity: '1', transform: 'translateY(0%)' },
        },
        slideLinks: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0%)' },
        },
        dragBounce: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(5px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
    },
  },
};
