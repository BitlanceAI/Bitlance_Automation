/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
                mono: ["'DM Mono'", 'ui-monospace', 'monospace'],
            },
            colors: {
                // Brand — extracted from Bitlance logo teal
                brand: {
                    DEFAULT:  '#26CECE',
                    light:    '#35DFDF',
                    dark:     '#1AA8A8',
                    subtle:   '#26CECE1A', // 10% opacity
                },
                // Design token surfaces (map to CSS vars)
                canvas:   'var(--bg)',
                surface:  'var(--surface)',
                border:   'var(--border)',
                primary:  'var(--text)',
                muted:    'var(--muted)',
                accent:   'var(--accent)',
                // Legacy real-estate palette — kept for existing pages
                're-navy':   '#0a192f',
                're-blue':   '#00bcd4',
                're-accent': '#3b82f6',
                're-dark':   '#020c1b',
                're-light':  '#e6f1ff',
                // SEO landing page palette
                dark:    '#0A0A0A',
                card:    '#1A1A1A',
            },
            animation: {
                'fade-in-up':   'fadeInUp 0.8s ease-out forwards',
                'pulse-slow':   'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient-x':   'gradient-x 3s ease infinite',
                // SEO landing animations
                'fade-up':        'fadeUp 0.6s ease forwards',
                'fade-in':        'fadeIn 0.5s ease forwards',
                'spin-slow':      'spin 8s linear infinite',
                'float':          'float 4s ease-in-out infinite',
                'glow':           'glow 2s ease-in-out infinite alternate',
                'typewriter':     'typewriter 3s steps(40) forwards',
                'blink':          'blink 1s step-end infinite',
                'slide-in-right': 'slideInRight 0.5s ease forwards',
                'border-flow':    'borderFlow 4s linear infinite',
                'shimmer':        'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeUp: {
                    '0%':   { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%':      { transform: 'translateY(-12px)' },
                },
                glow: {
                    '0%':   { boxShadow: '0 0 20px rgba(38,206,206,0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(38,206,206,0.7)' },
                },
                typewriter: {
                    '0%':   { width: '0' },
                    '100%': { width: '100%' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%':      { opacity: '0' },
                },
                slideInRight: {
                    '0%':   { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                borderFlow: {
                    '0%':   { backgroundPosition: '0% 50%' },
                    '50%':  { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                shimmer: {
                    '0%':   { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
