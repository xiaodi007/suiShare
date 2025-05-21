/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
  './src/*.{js,ts,jsx,tsx,mdx}',
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4E47FF'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addComponents }) {
      addComponents({
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem', // 默认圆角
          fontSize: '1.6vw',
          fontWeight: '600',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
          '&:hover': {
            opacity: '0.9',
          },
          // 默认样式
          '&.btn-primary': {
            backgroundColor: '#2cb4cd',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#26a3b7', // 深一点的主色
            },
          },
          '&.btn-secondary': {
            backgroundColor: '#9333EA',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#7E22CE', // 深一点的次色
            },
          },
        },
      });
    },
  ],
}
