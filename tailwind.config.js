/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Mantener la configuración pero no usar la clase
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        in: "fadeIn 0.2s ease-in-out",
        out: "fadeOut 0.2s ease-in-out",
        "slide-in-from-right": "slideInFromRight 0.3s ease-in-out",
        "slide-out-to-right": "slideOutToRight 0.3s ease-in-out",
        "slide-in-from-left": "slideInFromLeft 0.3s ease-in-out",
        "slide-out-to-left": "slideOutToLeft 0.3s ease-in-out",
        "slide-in-from-top": "slideInFromTop 0.3s ease-in-out",
        "slide-out-to-top": "slideOutToTop 0.3s ease-in-out",
        "slide-in-from-bottom": "slideInFromBottom 0.3s ease-in-out",
        "slide-out-to-bottom": "slideOutToBottom 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOutToRight: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        slideInFromLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOutToLeft: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideOutToTop: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
        slideInFromBottom: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideOutToBottom: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
