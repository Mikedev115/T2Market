import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the build works from any sub-path (e.g. GitHub Pages /<repo>/); routing uses the URL hash.
// When a backend exists, proxy /api to it:
// server: { proxy: { '/api': 'http://localhost:3000' } }
export default defineConfig({ base: './', plugins: [react()] });
