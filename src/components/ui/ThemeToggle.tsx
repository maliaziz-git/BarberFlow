"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "sidebar";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "icon",
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid layout shift before hydration
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600 shadow-sm"
            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
          isDark
            ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
            : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        aria-label="Toggle theme"
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>Appearance</span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/20 dark:bg-slate-900/40">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
        isDark
          ? "bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800 hover:border-slate-700"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm"
      } ${className}`}
      title={`Switch to ${isDark ? "Light" : "Dark"} theme`}
      aria-label="Toggle light or dark theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-emerald-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
