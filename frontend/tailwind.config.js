// eng4IT/frontend/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        dark: {
          DEFAULT: "var(--color-background)",
          card: "var(--color-card)",
          lighter: "#2d2d2d",
        },
      },
      backgroundColor: {
        "primary-20": "rgba(74, 222, 128, 0.2)",
      },
    },
  },
  plugins: [],
};
