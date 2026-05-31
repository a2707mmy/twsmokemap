/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色：沉穩的青藍，乾淨、不刺眼
        brand: {
          50: '#eef7f7',
          100: '#d6ecec',
          500: '#0e8d8d',
          600: '#0b7575',
          700: '#095e5e',
        },
        // 吸菸區 = 官方（青藍）/ 眾包（琥珀）；煙味回報 = 紅
        official: '#0b7575',
        crowd: '#d97706',
        smell: '#dc2626',
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
