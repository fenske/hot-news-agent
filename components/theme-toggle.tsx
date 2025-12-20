"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 flex items-center justify-center group"
      aria-label={`Current theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      {/* Sun icon */}
      <Sun
        className={`w-4 h-4 absolute transition-all duration-300 ${
          theme === "light"
            ? "opacity-100 rotate-0 scale-100 text-amber-500"
            : "opacity-0 rotate-90 scale-50 text-zinc-400"
        }`}
      />

      {/* Moon icon */}
      <Moon
        className={`w-4 h-4 absolute transition-all duration-300 ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100 text-orange-400"
            : "opacity-0 -rotate-90 scale-50 text-zinc-400"
        }`}
      />

      {/* System/Monitor icon */}
      <Monitor
        className={`w-4 h-4 absolute transition-all duration-300 ${
          theme === "system"
            ? "opacity-100 rotate-0 scale-100 text-zinc-600 dark:text-zinc-300"
            : "opacity-0 rotate-90 scale-50 text-zinc-400"
        }`}
      />

      {/* Hover ring effect */}
      <span className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-orange-500/20 transition-all duration-200" />
    </button>
  );
}
