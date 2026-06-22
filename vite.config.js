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
      manifest: {
        name: 'FakhriMusic',
        short_name: 'FakhriMusic',
        description: 'Premium music player',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
