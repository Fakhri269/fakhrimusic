import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ytSearch from 'yt-search'

import { VitePWA } from 'vite-plugin-pwa'

const ytSearchPlugin = () => ({
  name: 'yt-search-api',
  configureServer(server) {
    server.middlewares.use('/api/yt-search', async (req, res, next) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const q = url.searchParams.get('q');
        if (!q) return next();
        
        const r = await ytSearch(q);
        const videos = r.videos.slice(0, 5);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(videos));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    ytSearchPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'FakhriMusic',
        short_name: 'FakhriMusic',
        description: 'Premium music streaming — listen to millions of songs',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['music', 'entertainment'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.youtube\.com\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
})
