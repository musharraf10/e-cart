module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f0f0f",
        card: "#171717",
        accent: "#d4af37",
        muted: "#a1a1aa",
        borderlux: "#262626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lux: "0 10px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
