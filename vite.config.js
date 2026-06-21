import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ytSearch from 'yt-search'

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
  plugins: [react(), ytSearchPlugin()],
})
