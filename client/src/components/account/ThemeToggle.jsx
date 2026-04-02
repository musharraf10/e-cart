import { HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext.jsx";

export function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-left transition-colors duration-200 active:scale-[0.99]"
      aria-label="Toggle color theme"
    >
      <div>
        <p className="text-sm font-semibold tracking-wide text-text-primary">Theme</p>
        <p className="text-xs text-text-muted">{isDark ? "Dark mode" : "Light mode"}</p>
      </div>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-bg-primary text-text-primary">
        {theme === "dark" ? <HiSun className="h-4 w-4" /> : <HiMoon className="h-4 w-4" />}
      </span>
    </button>
  );
}
