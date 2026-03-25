/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                health: {
                    teal: '#2AB0B8',
                    lightTeal: '#E0F2F3',
                    bg: '#F8FBFC',
                    sidebar: '#FFFFFF',
                    text: '#2C3E50',
                    muted: '#7F8C8D',
                    border: '#E0EAEB'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
