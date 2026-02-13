/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                're-navy': '#0a192f',
                're-blue': '#00bcd4', // Electric blue
                're-accent': '#3b82f6',
                're-dark': '#020c1b',
                're-light': '#e6f1ff',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
