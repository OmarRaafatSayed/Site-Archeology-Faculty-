/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Palette مصرية قديمة ───────────────────────────── */
        /* Gold — ذهب الفراعنة */
        gold: {
          50:  '#fdf9ed',
          100: '#faf0cc',
          200: '#f4dc8a',
          300: '#ecc84a',
          400: '#e0b020',
          500: '#C9A84C',   /* اللون الأساسي */
          600: '#a8882a',
          700: '#866814',
          800: '#644d0d',
          900: '#3d2f08',
          950: '#1e1703',
        },
        /* Lapis — أزرق اللازورد المصري */
        lapis: {
          50:  '#eef3fb',
          100: '#d5e3f5',
          200: '#aac6eb',
          300: '#6ea0d8',
          400: '#3a78be',
          500: '#1B4F8A',   /* أزرق لازوردي */
          600: '#153e6e',
          700: '#102f54',
          800: '#0b203a',
          900: '#061120',
        },
        /* Sand — رمال الصحراء */
        sand: {
          50:  '#fdf8f0',
          100: '#f8edd6',
          200: '#f0d9a8',
          300: '#e5be72',
          400: '#d9a23c',
          500: '#C4892A',
          600: '#a06e1f',
          700: '#7d5416',
          800: '#5a3c0f',
          900: '#3a2609',
        },
        /* Papyrus — بيج البردي */
        papyrus: {
          50:  '#fefcf5',
          100: '#fdf5e0',
          200: '#faebc1',
          300: '#f5da92',
          400: '#eec45a',
          500: '#e5ac2e',
          600: '#c48e1e',
          700: '#9e6f14',
          800: '#74510e',
          900: '#4a3308',
        },
        /* Nile — أخضر النيل */
        nile: {
          50:  '#edfaf4',
          100: '#d0f3e3',
          200: '#9de5c5',
          300: '#5fcea1',
          400: '#2caf7e',
          500: '#1A7A55',   /* أخضر نيلي */
          600: '#146144',
          700: '#0f4a33',
          800: '#0a3224',
          900: '#051a13',
        },
        /* Terracotta — فخار مصري */
        terra: {
          50:  '#fef4ef',
          100: '#fde5d4',
          200: '#fac7a8',
          300: '#f5a272',
          400: '#ed7540',
          500: '#C4522A',   /* ترقوازي أحمر */
          600: '#9e3f1e',
          700: '#7a2f15',
          800: '#56210d',
          900: '#311208',
        },
        /* Obsidian — أسود البازلت */
        obsidian: {
          50:  '#f4f4f5',
          100: '#e4e4e7',
          200: '#c8c8cd',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#3f3f46',
          600: '#27272a',
          700: '#18181b',
          800: '#121214',
          900: '#09090b',
        },
        /* Aliases للتوافق مع الكود القديم */
        primary: {
          50:  '#fdf9ed',
          100: '#faf0cc',
          200: '#f4dc8a',
          300: '#ecc84a',
          400: '#e0b020',
          500: '#C9A84C',
          600: '#a8882a',
          700: '#866814',
          800: '#644d0d',
          900: '#3d2f08',
        },
        egyptology:   '#C9A84C',
        islamic:      '#1A7A55',
        conservation: '#C4522A',
        'greco-roman':'#1B4F8A',
      },

      fontFamily: {
        arabic:     ['Cairo', 'Tajawal', 'sans-serif'],
        english:    ['Inter', 'sans-serif'],
        hieroglyph: ['Noto Sans Egyptian Hieroglyphs', 'serif'],
      },

      backgroundImage: {
        /* نمط الهيروغليف المتكرر — SVG inline */
        'hieroglyph-pattern': "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.08'%3E%3Cpath d='M40 0 L50 10 L40 8 L30 10 Z'/%3E%3Crect x='38' y='8' width='4' height='20'/%3E%3Cellipse cx='40' cy='32' rx='6' ry='4'/%3E%3Cpath d='M34 36 L40 44 L46 36'/%3E%3Crect x='36' y='44' width='3' height='12'/%3E%3Crect x='41' y='44' width='3' height='12'/%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3Crect x='17' y='23' width='6' height='2'/%3E%3Ccircle cx='60' cy='20' r='3'/%3E%3Crect x='57' y='23' width='6' height='2'/%3E%3Cpath d='M15 55 Q20 50 25 55 Q20 60 15 55'/%3E%3Cpath d='M55 55 Q60 50 65 55 Q60 60 55 55'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        /* تدرج الذهب */
        'gold-gradient':  'linear-gradient(135deg, #C9A84C 0%, #e0b020 40%, #C4892A 100%)',
        /* تدرج الليل على النيل */
        'nile-gradient':  'linear-gradient(180deg, #061120 0%, #0b203a 50%, #0f4a33 100%)',
        /* تدرج البردي */
        'papyrus-gradient': 'linear-gradient(135deg, #fdf5e0 0%, #f5da92 100%)',
        /* تدرج الحجر */
        'stone-gradient': 'linear-gradient(180deg, #1e1b14 0%, #2d2618 60%, #3d2f08 100%)',
      },

      boxShadow: {
        'gold':    '0 4px 24px -4px rgba(201,168,76,0.45)',
        'gold-lg': '0 8px 40px -8px rgba(201,168,76,0.5)',
        'lapis':   '0 4px 24px -4px rgba(27,79,138,0.4)',
        'inset-gold': 'inset 0 1px 0 rgba(201,168,76,0.3)',
      },

      animation: {
        'float':       'float 6s ease-in-out infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'scan-line':   'scanLine 4s linear infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(8px)' },
          '50%':       { opacity: '1',   filter: 'blur(12px)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },

      borderRadius: {
        'cartouche': '50px',
      },
    },
  },
  plugins: [],
};
