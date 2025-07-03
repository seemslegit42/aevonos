
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        body: ['Lexend', 'sans-serif'],
        headline: ['Comfortaa', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Thematic colors
        'sidekick-brown': 'hsl(var(--sidekick-brown))',
        'sidekick-gold': 'hsl(var(--sidekick-gold))',
        'sidekick-gold-foreground': 'hsl(var(--sidekick-gold-foreground))',
        'gilded-accent': 'hsl(var(--gilded-accent))',
        'military-green': 'hsl(var(--military-green))',
        'ledger-cream': 'hsl(var(--ledger-cream))',
        'steely-lavender': 'hsl(var(--steely-lavender))',
        'polished-chrome': 'hsl(var(--polished-chrome))',
        'faded-cream': 'hsl(var(--faded-cream))',
        'pale-green': 'hsl(var(--pale-green))',
        'stonks-green': 'hsl(var(--stonks-green))',
        'stonks-anxiety': 'hsl(var(--stonks-anxiety))',
        'kendra-fuchsia': 'hsl(var(--kendra-fuchsia))',
        'y2k-blueviolet': 'hsl(var(--y2k-blueviolet))',
        'noir-sepia': 'hsl(var(--noir-sepia))',
        'noir-ink': 'hsl(var(--noir-ink))',
        'roman-aqua': 'hsl(var(--roman-aqua))',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        aurora: {
          from: {
            backgroundPosition: '0% 50%',
          },
          to: {
            backgroundPosition: '100% 50%',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        aurora: 'aurora 15s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
