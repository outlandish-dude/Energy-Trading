/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0A0F1C",
        glass: "rgba(255,255,255,0.08)",
        pulse: "#00D1B2",
        alert: "#FF6B6B",
        primary: { 50: "#f0f9ff", 500: "#0ea5e9", 600: "#0284c7", 900: "#082f49" },
        secondary: { 500: "#06b6d4", 600: "#0891b2" },
        success: { 500: "#10b981", 600: "#059669" },
        warning: { 500: "#f59e0b", 600: "#d97706" },
        danger: { 500: "#ef4444", 600: "#dc2626" },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 209, 178, 0.3)",
        "glow-blue": "0 0 20px rgba(14, 165, 233, 0.3)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3)",
        "card": "0 4px 30px rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
