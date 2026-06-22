import React, { useEffect, useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { getInitialsCover } from '../utils/coverFallback';

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

const NowPlayingSidebar = ({ currentSong, onClose, onExpandLyrics }) => {
  const { currentTime } = useMusic();
  const [lyricsData, setLyricsData] = useState([]);
  const [activeLine, setActiveLine] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSong) return;
    setLyricsData([]);
    setActiveLine(0);
    setLoading(true);
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

  useEffect(() => {
    if (!lyricsData.length) return;
    let idx = 0;
    for (let i = 0; i < lyricsData.length; i++) {
      if (lyricsData[i].time <= currentTime) idx = i;
      else break;
    }
    setActiveLine(idx);
  }, [currentTime, lyricsData]);

  if (!currentSong) return null;

  const visible = lyricsData.slice(Math.max(0, activeLine - 1), activeLine + 5);

  return (
    <aside className="sp-now-playing-sidebar">
      <div className="sp-nps-header">
        <span>Now playing view</span>
        <button onClick={onClose}><X size={18} /></button>
      </div>

      <img src={currentSong.cover} alt={currentSong.title} className="sp-nps-cover" onError={(e) => { e.target.onerror = null; e.target.src = getInitialsCover(currentSong.title); }} />

      <div className="sp-nps-track">
        <div className="sp-nps-title">{currentSong.title}</div>
        <div className="sp-nps-artist">{currentSong.artist}</div>
      </div>

      <div className="sp-nps-scroll">
        {/* Lyrics card */}
        <div className="sp-lyrics-card" onClick={onExpandLyrics}>
          <div className="sp-lyrics-card-header">
            <span>Lyrics</span>
            <Maximize2 size={14} />
          </div>
          {loading ? (
            <div className="sp-lyrics-preview-line" style={{ opacity: 0.5 }}>Memuat lirik...</div>
          ) : lyricsData.length === 0 ? (
            <div className="sp-lyrics-preview-line" style={{ opacity: 0.5 }}>Lirik tidak ditemukan.</div>
          ) : (
            <>
              {visible.map((line, i) => {
                const globalIdx = lyricsData.indexOf(line);
                return (
                  <div
                    key={globalIdx}
                    className={`sp-lyrics-preview-line ${globalIdx === activeLine ? 'active' : ''}`}
                  >
                    {line.text}
                  </div>
                );
              })}
              <div style={{ marginTop: 10, opacity: 0.4, fontSize: '0.75rem', fontWeight: 600 }}>
                Klik untuk lihat semua →
              </div>
            </>
          )}
        </div>

        {/* About artist */}
        <div className="sp-about-card">
          <h4>About the artist</h4>
          <p>
            {currentSong.artist} adalah salah satu musisi paling populer saat ini.
            Lagu "{currentSong.title}" dari album {currentSong.album} telah didengarkan
            lebih dari {fmtPlays(currentSong.plays)} kali di seluruh dunia.
          </p>
        </div>
      </div>
    </aside>
  );
};

function fmtPlays(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return n;
}

export default NowPlayingSidebar;
