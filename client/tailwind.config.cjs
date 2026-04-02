module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        card: "#111111",
        muted: "#a1a1aa",
        border: "#262626",
        accent: "#a6c25e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["General Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.25)",
        "accent-glow": "0 0 24px rgba(212,175,55,0.15)",
      },
      transitionDuration: {
        200: "200ms",
        300: "300ms",
      },
    },
  },
  plugins: [],
};
