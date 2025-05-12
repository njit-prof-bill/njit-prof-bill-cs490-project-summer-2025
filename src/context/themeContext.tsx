import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeType = "system" | "light" | "dark";

interface ThemeContextProps {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeType>("system");

    useEffect(() => {
        const savedTheme = (localStorage.getItem("theme") as ThemeType) || "system";
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (selectedTheme: ThemeType) => {
            if (selectedTheme === "light") {
                root.classList.remove("dark");
            } else if (selectedTheme === "dark") {
                root.classList.add("dark");
            } else if (selectedTheme === "system") {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (prefersDark) {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
            }
        };

        applyTheme(theme);
        localStorage.setItem("theme", theme);

        // Add a listener for system theme changes if "system" is selected
        let mediaQuery: MediaQueryList | null = null;
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                applyTheme(e.matches ? "dark" : "light");
            }
        };

        if (theme === "system") {
            mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            mediaQuery.addEventListener("change", handleSystemThemeChange);
        }

        // Cleanup the listener on unmount or when the theme changes
        return () => {
            if (mediaQuery) {
                mediaQuery.removeEventListener("change", handleSystemThemeChange);
            }
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};