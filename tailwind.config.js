module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Include all files in the src directory
    "./src/app/**/*.{js,ts,jsx,tsx}", // Explicitly include app directory
    "./src/components/**/*.{js,ts,jsx,tsx}", // Explicitly include components directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};