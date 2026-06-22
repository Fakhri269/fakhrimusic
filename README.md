# FakhriMusic 🎵

A premium, modern web-based music player built with React.js, featuring a stunning UI inspired by the best of Spotify and Apple Music.

## Features ✨

- **Premium Lyrics UI**: A breathtaking full-page lyrics experience with dynamic "breathing" background blurs, glass-morphism effects, and synchronized scrolling.
- **Mobile Immersive Mode**: On mobile devices, the Now Playing view is a seamless, scrollable experience that includes the cover art, lyrics, and an "About the Artist" section.
- **Smart Artist Insights**: Automatically fetches the artist's photo and biography from Wikipedia.
- **YouTube Music Integration**: Search and play almost any song using the YouTube API under the hood.
- **Synced Lyrics**: Fetches time-synced lyrics from LRCLib for karaoke-style playback.
- **Lucide Icons**: Clean and modern iconography.

## Tech Stack 🛠️

- React 18 (Vite)
- Vanilla CSS (for maximum flexibility and performance)
- Lucide React (Icons)
- Context API (State Management)

## API Integrations 🔗

This project is powered by several robust APIs working together seamlessly:
- **Audio Playback Resolution:** Uses a multi-tiered fallback architecture to find the correct YouTube video ID for any song:
  1. **Local Cache:** A pre-fetched JSON dictionary of 100+ popular songs for instant, zero-latency playback.
  2. **YouTube Data API v3:** The primary search engine (requires an API key in `.env`).
  3. **AllOrigins Proxy Scraper:** A fallback web scraper that bypasses CORS issues if the API key is missing or quota is exceeded.
- **LRCLib API:** Provides highly accurate, time-synced lyrics (`.lrc` format) for the karaoke-style scrolling experience.
- **Wikipedia REST API:** Automatically fetches high-quality artist photos and short biographies for the "About the Artist" section.

## How to Run Locally 🚀

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Design Philosophy 💎

FakhriMusic prioritizes **Visual Excellence**. The interface avoids generic colors and instead relies on smooth gradients, deep contrast, and subtle micro-animations to create a state-of-the-art user experience. 

---
*Built with passion.*
