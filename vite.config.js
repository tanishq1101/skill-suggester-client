const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

const viteApiBaseUrl = process.env.VITE_API_BASE_URL || '';

module.exports = defineConfig({
    plugins: [react()],
    define: {
        'process.env.VITE_API_BASE_URL': JSON.stringify(viteApiBaseUrl)
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    preview: {
        host: true
    }
});
