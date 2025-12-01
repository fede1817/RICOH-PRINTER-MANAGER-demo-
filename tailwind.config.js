/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "modal-appear": "modalAppear 0.3s ease-out",
      },
      keyframes: {
        modalAppear: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9) translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
