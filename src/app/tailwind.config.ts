import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f3f4f6",
          dark: "#111827",
          nick: "#2596be",
          solarized: "#002b36",
        },
        foreground: {
          DEFAULT: "#111827",
          dark: "#f3f4f6",
          nick: "#e0a635",
          solarized: "#839496",
        },
      },
    },
  },
  darkMode: "class", // needed for dark mode toggle
  plugins: [
    plugin(({ addVariant, e }) => {
      addVariant("nick", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.nick .${e(`nick${separator}${className}`)}`;
        });
      });
      addVariant("solarized", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `.solarized .${e(`solarized${separator}${className}`)}`;
        });
      });
    }),
  ],
};

export default config;
