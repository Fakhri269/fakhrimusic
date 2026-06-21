import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

function parseLRC(lrcText) {
  if (!lrcText) return [];
  return lrcText.split('\n')
    .map(line => {
      const m = line.match(/^\[(\d+):(\d+\.\d+)\]\s*(.*)/);
      if (!m) return null;
      const text = m[3].trim();
      if (!text) return null;
      return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);
}

const FullPageLyrics = ({ currentSong, onClose }) => {
  const { currentTime } = useMusic();
  const [lyricsData, setLyricsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLine, setActiveLine] = useState(0);
  const activeRef = useRef(null);

  useEffect(() => {
    if (!currentSong) return;
    setLoading(true);
    setLyricsData([]);
    setActiveLine(0);
    const artist = currentSong.artist.split(/ft\.|feat\.| & /i)[0].trim();
    fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(currentSong.title)}&artist_name=${encodeURIComponent(artist)}`)
      .then(r => r.json())
      .then(results => {
        if (results?.length > 0) {
          const synced = results.find(r => r.syncedLyrics);
          if (synced?.syncedLyrics) {
            setLyricsData(parseLRC(synced.syncedLyrics));
          } else if (results[0].plainLyrics) {
            setLyricsData(
              results[0].plainLyrics.split('\n')
                .filter(l => l.trim())
                .map((text, i) => ({ time: i * 4, text }))
            );
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

  // Auto-scroll
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLine]);

  if (!currentSong) return null;

  return (
    <div className="sp-fpl">
      <div className="sp-fpl-bg" style={{ backgroundImage: `url(${currentSong.cover})` }} />
      <div className="sp-fpl-overlay" />

      {/* Topbar */}
      <div className="sp-fpl-topbar">
        <div className="sp-fpl-topbar-info">
          <img src={currentSong.cover} alt="" className="sp-fpl-mini-cover" />
          <div>
            <div className="sp-fpl-topbar-title">{currentSong.title}</div>
            <div className="sp-fpl-topbar-artist">{currentSong.artist}</div>
          </div>
        </div>
        <button className="sp-fpl-close" onClick={onClose}>
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="sp-fpl-body">
        {/* Left: album + info */}
        <div className="sp-fpl-left">
          <img src={currentSong.cover} alt={currentSong.title} className="sp-fpl-album" />
          <div className="sp-fpl-track-info">
            <div className="sp-fpl-track-title">{currentSong.title}</div>
            <div className="sp-fpl-track-artist">{currentSong.artist}</div>
          </div>
        </div>

        {/* Right: synced lyrics */}
        <div className="sp-fpl-right">
          <div className="sp-fpl-lyrics-label">Lyrics</div>
          {loading ? (
            <div className="sp-fpl-loading">Memuat lirik...</div>
          ) : lyricsData.length === 0 ? (
            <div className="sp-fpl-loading">Lirik tidak ditemukan untuk lagu ini.</div>
          ) : (
            <div className="sp-fpl-lines">
              {lyricsData.map((line, i) => (
                <div
                  key={i}
                  ref={i === activeLine ? activeRef : null}
                  className={`sp-fpl-line ${i === activeLine ? 'active' : ''}`}
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
