
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
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
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
        aurora: {
          from: {
            backgroundPosition: '0% 50%',
          },
          to: {
            backgroundPosition: '100% 50%',
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "screen-shake": {
          "0%": { transform: "translate(1px, 1px) rotate(0deg)" },
          "10%": { transform: "translate(-1px, -2px) rotate(-0.5deg)" },
          "20%": { transform: "translate(-3px, 0px) rotate(0.5deg)" },
          "30%": { transform: "translate(3px, 2px) rotate(0deg)" },
          "40%": { transform: "translate(1px, -1px) rotate(0.5deg)" },
          "50%": { transform: "translate(-1px, 2px) rotate(-0.5deg)" },
          "60%": { transform: "translate(-3px, 1px) rotate(0deg)" },
          "70%": { transform: "translate(3px, 1px) rotate(-0.5deg)" },
          "80%": { transform: "translate(-1px, -1px) rotate(0.5deg)" },
          "90%": { transform: "translate(1px, 2px) rotate(0deg)" },
          "100%": { transform: "translate(1px, -2px) rotate(-0.5deg)" },
        },
      },
      animation: {
        aurora: 'aurora 15s ease infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "screen-shake": "screen-shake 0.5s",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
