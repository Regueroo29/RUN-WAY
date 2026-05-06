import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    build: {
        // Split chunks for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['socket.io-client'], // Add other heavy libs
                }
            }
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 500,
        // Minify better
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true
            }
        }
    }
});