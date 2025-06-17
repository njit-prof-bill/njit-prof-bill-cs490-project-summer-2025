"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const htmlElement = document.documentElement;

        const updateTheme = () => {
            const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (isDarkMode) {
                htmlElement.classList.add("dark");
            } else {
                htmlElement.classList.remove("dark");
            }
        };

        // Set initial theme
        updateTheme();

        // Listen for changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", updateTheme);

        return () => {
            mediaQuery.removeEventListener("change", updateTheme);
        };
    }, []);

    return <>{children}</>;
}