import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}", // Include all files in the src directory
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;