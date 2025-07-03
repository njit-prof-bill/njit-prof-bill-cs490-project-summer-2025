import type { Config } from "tailwindcss";
// darkMode: 'class',

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "#f3f4f6", // Light mode background (gray-100)
                    dark: "#111827", // Dark mode background (gray-900)
                },
                foreground: {
                    DEFAULT: "#111827", // Light mode text (gray-900)
                    dark: "#f3f4f6", // Dark mode text (gray-100)
                },
            },
        },
    },
    darkMode: "class", // Enable dark mode using the "class" strategy
    plugins: [
        // require("daisyui"), // Removed DaisyUI
        function ({ addVariant }: { addVariant: any }) {
            // No pink variant
        },
    ],
};

export default config;