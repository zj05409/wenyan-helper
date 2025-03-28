import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3000,
        open: true,
        cors: true,
        host: '0.0.0.0',
    },
    build: {
        outDir: 'build',
        sourcemap: true,
    },
}); 