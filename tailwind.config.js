/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: "#1C1412",
        leather: "#6B3A2A",
        gold: "#C49A3C",
        cream: "#FAF7F4",
        ink: "#1A1A1A",
        success: "#2D6A4F",
        danger: "#B42318",
        surface: {
          50: "#FDFBF9",
          100: "#F4EEE9",
          200: "#F0E8E0",
          300: "#EEE4DB",
          400: "#E8DED5",
          500: "#D7CBC1",
        },
        neutral: {
          600: "#8A7A72",
          700: "#7F7068",
          800: "#6A5B54",
          900: "#5A4A44",
        },
      },
      boxShadow: {
        card: "0 10px 30px -14px rgba(28,20,18,0.35)",
      },
    },
  },
  plugins: [],
};
