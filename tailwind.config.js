/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                slate: {
                    850: '#1e293b', // Custom dark shade
                }
            },
            animation: {
                'bounce-subtle': 'bounce-subtle 3s infinite',
                'blob': 'blob 7s infinite',
                'gradient-xy': 'gradient-xy 15s ease infinite',
            },
            keyframes: {
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
                    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'gradient-xy': {
                    '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left top' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right bottom' },
                },
            },
        }
    },
    plugins: [],
}
