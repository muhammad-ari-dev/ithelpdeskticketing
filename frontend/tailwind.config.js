/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
            },
            colors: {
                'brand-blue': '#3B82F6',
                'brand-blue-dark': '#1E40AF',
                'brand-blue-deeper': '#1E3A8A',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleUp: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                waveMove: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                slideUpFade: {
                    '0%': { opacity: '0', transform: 'translateY(25px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                waveSweep: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            },
            animation: {
                'gradient': 'gradient 10s ease infinite',
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-up': 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'wave': 'waveMove 12s linear infinite',
                'float': 'float 4s ease-in-out infinite',
                'slide-up-fade': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'wave-sweep': 'waveSweep 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards',
            }
        },
    },
    plugins: [],
}