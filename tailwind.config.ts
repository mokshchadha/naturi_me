import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-orange": "#FF8C42",
        "primary-green": "#7CB342",
        "primary-brown": "#8B6F47",
        "light-bg": "#FFFFFF",
        "light-text": "#171717",
        "dark-bg": "#0A0A0A",
        "dark-text": "#F5F5F5",
      },
    },
  },
  plugins: [],
};

export default config;