module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "hsl(var(--bg-primary) / <alpha-value>)",
        primary: "hsl(var(--bg-primary) / <alpha-value>)",
        card: "hsl(var(--bg-secondary) / <alpha-value>)",
        muted: "hsl(var(--text-muted) / <alpha-value>)",
        border: "hsl(var(--border-subtle) / <alpha-value>)",

        "bg-secondary": "hsl(var(--bg-secondary) / <alpha-value>)",
        "text-primary": "hsl(var(--text-primary) / <alpha-value>)",
        "text-muted": "hsl(var(--text-muted) / <alpha-value>)",
        "border-subtle": "hsl(var(--border-subtle) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 28px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};
