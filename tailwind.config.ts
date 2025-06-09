import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}", // Include all files in the src directory
    ],
    theme: {
        extend: {
            colors: {
                background: {

                    // DEFAULT: "#f3f4f6", // Light mode background (gray-100)
                    // dark: "#111827", // Dark mode background (gray-900)

                    
                    DEFAULT: "#303030", // Light mode background (gray-100)
                    dark: "#111827", // Dark mode background (gray-900)
                },
                foreground: {
                    // DEFAULT: "#111827", // Light mode text (gray-900)

                    // dark: "#f3f4f6", // Dark mode text (gray-100)



                    DEFAULT: "#303030", // Light mode text (gray-900)

                    dark: "#f3f4f6", // Dark mode text (gray-100)

                },
            },
        },
    },
    darkMode: "class", // Enable dark mode using the "class" strategy
    plugins: [],
};

export default config;