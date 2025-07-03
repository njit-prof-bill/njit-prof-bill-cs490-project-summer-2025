"use client";

import { useTheme } from "@/context/themeContext";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4 mr-2" /> },
  { value: "light", label: "Light", icon: <Sun className="w-4 h-4 mr-2 text-yellow-400" /> },
  { value: "system", label: "System", icon: <span className="w-4 h-4 mr-2 font-bold text-gray-500">A</span> },
] as const;
type ThemeOption = typeof themes[number]["value"];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(theme as ThemeOption);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActiveTheme(theme as ThemeOption);
  }, [theme]);

  const handleThemeChange = (selected: ThemeOption) => {
    setTheme(selected);
    setOpen(false);
  };

  const current = themes.find((t) => t.value === activeTheme);

  return (
    <div className="fixed top-6 right-24 z-50">
      <div className="relative inline-block text-left">
        <button
          type="button"
          className="inline-flex w-40 justify-center items-center rounded-full border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          id="theme-menu"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {current?.icon}
          {current?.label}
          <svg className="ml-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              {themes.map((t) => (
                <button
                  key={t.value}
                  className={`flex items-center w-full px-4 py-2 text-sm text-left rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    activeTheme === t.value
                      ? "font-bold text-primary bg-gray-100 dark:bg-gray-700"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  onClick={() => handleThemeChange(t.value)}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
