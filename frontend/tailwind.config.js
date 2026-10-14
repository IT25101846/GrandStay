/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        // GrandStay Luxury Architectural Palette
        // ☀️ Light Mode: The "Grand Lobby"
        linen: '#FDFDFB',       // Primary Background
        travertine: '#F6F4EE',  // Secondary Surface (Cards, Filters)
        ink: '#141312',         // Primary Typography
        sand: '#66625C',        // Secondary Typography
        mortar: '#EBE7DF',      // Borders & Gridlines

        // 🌙 Dark Mode: The "Penthouse Lounge"
        obsidian: '#0E0E0D',    // Primary Background
        walnut: '#1A1917',      // Secondary Surface
        ivorySilk: '#F0ECE4',   // Primary Typography
        cashmere: '#ADA79E',    // Secondary Typography
        gunmetal: '#2A2825',    // Borders & Gridlines

        gold: {
          50:  '#FDFBF7',
          100: '#FAF4E6',
          200: '#F4E7C4',
          300: '#F3E5AB',
          400: '#E5C07B',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#8A6808',
          800: '#6D5106',
          900: '#523D04',
        },
        ivory: {
          50:  '#FDFDFB',
          100: '#F6F4EE',
          200: '#EBE7DF',
          300: '#DDD8CE',
          400: '#C7C0B3',
          500: '#ADA79E',
        },
        primary: {
          50:  '#faf7f4',
          100: '#f0e9e1',
          200: '#ded0c2',
          300: '#c9b09c',
          400: '#b2907a',
          500: '#9c7560',
          600: '#8a6452',
          700: '#725245',
          800: '#5f453b',
          900: '#4f3a33',
        },
        dark: {
          DEFAULT: '#0E0E0D', // Obsidian Marble Black (Primary Background)
          950: '#0E0E0D',     // Obsidian Marble Black
          900: '#1A1917',     // Polished Walnut Wood (Secondary Surface)
          850: '#201E1C',     // Elevated Walnut
          800: '#24221F',     // Secondary Surface Alt / Hover
          750: '#2A2825',     // Brushed Gunmetal
          700: '#2A2825',     // Borders & Gridlines
          600: '#3A3732',     // Elevated borders
        }
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'light-card': '0 10px 30px -10px rgba(120, 80, 20, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}
