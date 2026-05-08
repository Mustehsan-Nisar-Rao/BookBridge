module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a3c5e",
        "primary-dark": "#0f2337",
        "primary-light": "#2a5580",
        secondary: "#4a7c59",
        "secondary-dark": "#355c42",
        gold: "#c5a028",
        "gold-light": "#e8c547",
        cream: "#faf8f3",
        beige: "#f0ebe0",
        success: "#28a745",
        danger: "#dc3545",
        warning: "#f59e0b",
        light: "#faf8f3",
        dark: "#0f2337"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        'bookbridge': '0 8px 40px rgba(26,60,94,0.18)',
        'bookbridge-lg': '0 16px 60px rgba(26,60,94,0.24)'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f2337 0%, #1a3c5e 50%, #2a5580 100%)',
        'cta-gradient': 'linear-gradient(135deg, #1a3c5e 0%, #0f2337 50%, #355c42 100%)',
      }
    }
  },
  plugins: []
};
