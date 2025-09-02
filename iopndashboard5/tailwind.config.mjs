/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom IOPn colors - Updated with new marketplace colors
        "bright-aqua": "#b0efff",        // Main highlight color
        "violet-indigo": "#4105b6",      // Main brand purple
        "crimson-red": "#6305b6",        // Secondary purple for alerts
        "amber-rust": "#2280cd",         // Medium blue for highlights
        "midnight-indigo": "#1d2449",    // Box shadow color
        "brand-dark": "#0f112a",         // Main background color
        "brand-light-text": "#f8fdf1",   // Primary text color
        "brand-gray": "#4f5262",         // Gray for muted text
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(176, 239, 255, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(176, 239, 255, 0.8)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "shine": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "data-flow": {
          "to": {
            left: "100%",
          },
        },
        "float-up": {
          "0%": {
            transform: "translateY(0) scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-100px) scale(1)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shine": "shine 8s linear infinite",
        "data-flow": "data-flow 3s linear infinite",
        "float-up": "float-up 2s ease-out forwards",
      },
      boxShadow: {
        'midnight': '0 0 20px rgba(29, 36, 73, 0.8)',
        'midnight-lg': '0 0 30px rgba(29, 36, 73, 0.9)',
        'aqua': '0 0 10px rgba(176, 239, 255, 0.5)',
        'aqua-lg': '0 0 30px rgba(176, 239, 255, 0.5)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}