/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        body: ['"Instrument Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Breakprout brand palette — high-voltage neon on obsidian
        obsidian: {
          950: '#03040A',
          900: '#07091A',
          800: '#0C0F28',
          700: '#141835',
        },
        volt: {
          DEFAULT: '#C8FF00',
          dim:     '#8FB800',
          glow:    '#EAFF7A',
        },
        plasma: {
          DEFAULT: '#FF3DF7',
          dim:     '#B82BB0',
        },
        ice: {
          DEFAULT: '#00E5FF',
          dim:     '#009FBF',
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'scan':       'scan 8s linear infinite',
        'streak':     'streak 2s ease-out forwards',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 20px #C8FF0088, 0 0 60px #C8FF0044' },
          '50%':      { textShadow: '0 0 40px #C8FF00CC, 0 0 100px #C8FF0066' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        streak: {
          '0%':   { transform: 'scaleX(0)', opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { transform: 'scaleX(1)', opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
