import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

// Parse LRC format: "[mm:ss.xx] line text"
function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const parsed = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+\.\d+)\]\s*(.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      if (text) {
        parsed.push({ time: minutes * 60 + seconds, text });
      }
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

const FullPageLyrics = ({ currentSong, onClose }) => {
  const { currentTime } = useMusic();
  const [lyricsData, setLyricsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLine, setActiveLine] = useState(0);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch synced lyrics from LRCLIB
  useEffect(() => {
    if (!currentSong) return;
    setLoading(true);
    setLyricsData([]);
    setActiveLine(0);

    // Parse artist: strip features like "ft. XXX"
    const artistClean = currentSong.artist.split(/ft\.|feat\.| & /i)[0].trim();
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(currentSong.title)}&artist_name=${encodeURIComponent(artistClean)}`;

    fetch(url)
      .then(r => r.json())
      .then(results => {
        if (results && results.length > 0) {
          // Prefer results with syncedLyrics
          const synced = results.find(r => r.syncedLyrics);
          if (synced && synced.syncedLyrics) {
            setLyricsData(parseLRC(synced.syncedLyrics));
          } else if (results[0].plainLyrics) {
            // Fallback: plain lyrics (no timestamps)
            const plain = results[0].plainLyrics.split('\n')
              .filter(l => l.trim())
              .map((text, i) => ({ time: i * 4, text }));
            setLyricsData(plain);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentSong?.id]);

  // Sync active line to currentTime
  useEffect(() => {
    if (!lyricsData.length) return;
    let idx = 0;
    for (let i = 0; i < lyricsData.length; i++) {
      if (lyricsData[i].time <= currentTime) idx = i;
      else break;
    }
    setActiveLine(idx);
  }, [currentTime, lyricsData]);

  // Auto-scroll active line into view
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLine]);

  if (!currentSong) return null;

  return (
    <div className="full-page-lyrics">
      <div
        className="fpl-background"
        style={{ backgroundImage: `url(${currentSong.cover})` }}
      />

      <div className="fpl-content">
        {/* Left: Album info */}
        <div className="fpl-left">
          <div className="fpl-header">
            <button className="fpl-close-btn" onClick={onClose} aria-label="Minimize">
              <ChevronDown size={24} />
            </button>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentSong.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{currentSong.artist}</div>
            </div>
          </div>
          <img src={currentSong.cover} alt={currentSong.title} className="fpl-cover" />
        </div>

        {/* Right: Synced Lyrics */}
        <div className="fpl-right" ref={containerRef}>
          <div className="fpl-lyrics-label">Lyrics</div>
          {loading ? (
            <div className="fpl-loading">Memuat lirik...</div>
          ) : lyricsData.length === 0 ? (
            <div className="fpl-loading">Lirik tidak ditemukan untuk lagu ini.</div>
          ) : (
            <div className="fpl-lyrics-container">
              {lyricsData.map((line, index) => (
                <div
                  key={index}
                  ref={index === activeLine ? activeLineRef : null}
                  className={`fpl-line ${index === activeLine ? 'active' : ''}`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullPageLyrics;
