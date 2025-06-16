import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            transform: 'translateX(-50%) translateY(-50%) rotate(0deg)',
          },
          '50%': {
            transform: 'translateX(-50%) translateY(-50%) rotate(180deg)',
          },
        },
        'text-slide': {
          '0%, 16.667%': {
            transform: 'translateY(0%)',
            opacity: '1',
          },
          '33.333%, 83.333%': {
            transform: 'translateY(-25%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0%)',
            opacity: '1',
          },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-shift': 'gradient-shift 20s ease infinite',
        'gradient-shift-delay-1': 'gradient-shift 20s ease infinite 4s',
        'gradient-shift-delay-2': 'gradient-shift 20s ease infinite 8s',
        'gradient-shift-delay-3': 'gradient-shift 20s ease infinite 12s',
        'gradient-shift-delay-4': 'gradient-shift 20s ease infinite 16s',
        'text-slide': 'text-slide 20s ease infinite',
        'text-slide-delay-1': 'text-slide 20s ease infinite 4s',
        'text-slide-delay-2': 'text-slide 20s ease infinite 8s',
        'text-slide-delay-3': 'text-slide 20s ease infinite 12s',
        'text-slide-delay-4': 'text-slide 20s ease infinite 16s',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config 