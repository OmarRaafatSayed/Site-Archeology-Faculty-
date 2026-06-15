import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ألوان الأقسام الأربعة
        egyptology: '#C9A84C',
        islamic: '#4A7C59',
        conservation: '#8B6914',
        'greco-roman': '#2C5282',
        // ألوان الكلية الرئيسية
        primary: {
          50: '#fdf8f0',
          100: '#f9eedc',
          500: '#C9A84C',
          600: '#b8923d',
          700: '#9a7a30',
          800: '#7d6227',
          900: '#5c4720',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
