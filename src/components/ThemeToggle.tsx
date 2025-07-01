"use client";

import { useTheme } from "@/context/themeContext";
import { Moon, Sun, Eye } from "lucide-react";
import { useEffect, useState } from "react";

const themes = ["dark", "light", "contrast"] as const;
type ThemeOption = typeof themes[number];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(theme as ThemeOption);

  useEffect(() => {
    setActiveTheme(theme as ThemeOption);
  }, [theme]);

  const handleThemeChange = (selected: ThemeOption) => {
    if (selected !== activeTheme) {
      setTheme(selected);
    }
  };

  const getThumbPosition = () => {
    switch (activeTheme) {
      case "dark":
        return "left-1";
      case "light":
        return "left-1/2 -translate-x-1/2";
      case "contrast":
        return "right-1";
    }
  };

  return (
  <div className="fixed top-6 right-24 z-50">
    <div className="flex items-center justify-between w-36 h-10 px-2 rounded-full bg-gray-200 dark:bg-gray-700 relative shadow-inner">
      <div
        className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 transform ${getThumbPosition()}`}
      />
      <button
        onClick={() => handleThemeChange("dark")}
        className="z-10 w-8 h-8 flex items-center justify-center"
        aria-label="Dark Mode"
      >
        <Moon className="w-5 h-5 text-black dark:text-white" />
      </button>
      <button
        onClick={() => handleThemeChange("light")}
        className="z-10 w-8 h-8 flex items-center justify-center"
        aria-label="Light Mode"
      >
        <Sun className="w-5 h-5 text-yellow-400" />
      </button>
      <button
        onClick={() => handleThemeChange("contrast")}
        className="z-10 w-8 h-8 flex items-center justify-center"
        aria-label="High Contrast Mode"
      >
        <Eye className="w-5 h-5 text-purple-500" />
      </button>
    </div>
  </div>
);
}
