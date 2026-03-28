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
            },
            animation: {
                'fade-in-up':   'fadeInUp 0.8s ease-out forwards',
                'pulse-slow':   'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient-x':   'gradient-x 3s ease infinite',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
