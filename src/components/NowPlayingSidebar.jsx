import React, { useEffect, useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

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
      if (text) parsed.push({ time: minutes * 60 + seconds, text });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

const NowPlayingSidebar = ({ currentSong, onClose, onExpandLyrics }) => {
  const { currentTime } = useMusic();
  const [lyricsData, setLyricsData] = useState([]);
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    if (!currentSong) return;
    setLyricsData([]);
    setActiveLine(0);
    const artistClean = currentSong.artist.split(/ft\.|feat\.| & /i)[0].trim();
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(currentSong.title)}&artist_name=${encodeURIComponent(artistClean)}`;
    fetch(url)
      .then(r => r.json())
      .then(results => {
        if (results && results.length > 0) {
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
      })
      .catch(() => {});
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

  // Show current and a few upcoming lines
  const visibleLines = lyricsData.slice(
    Math.max(0, activeLine - 1),
    activeLine + 6
  );

  return (
    <aside className="right-sidebar">
      <div className="now-playing-header">
        <span>Now playing view</span>
        <button onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>

      <div className="now-playing-cover">
        <img src={currentSong.cover} alt={currentSong.title} />
      </div>

      <div className="now-playing-info">
        <div className="title">{currentSong.title}</div>
        <div className="artist">{currentSong.artist}</div>
      </div>

      <div className="about-artist-card">
        <h3>About the artist</h3>
        <p>
          {currentSong.artist} adalah salah satu musisi populer saat ini.
          Lagu "{currentSong.title}" telah diputar lebih dari jutaan kali di seluruh dunia!
        </p>
      </div>

      <div
        className="lyrics-card"
        onClick={onExpandLyrics}
        style={{ cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div className="lyrics-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Lyrics</span>
          <Maximize2 size={16} />
        </div>
        <div className="lyrics-content">
          {lyricsData.length === 0 ? (
            <div className="lyrics-line" style={{ opacity: 0.5 }}>Memuat lirik...</div>
          ) : (
            visibleLines.map((line, i) => {
              const isActive = lyricsData.indexOf(line) === activeLine;
              return (
                <div
                  key={lyricsData.indexOf(line)}
                  className={`lyrics-line ${isActive ? 'active' : ''}`}
                >
                  {line.text}
                </div>
              );
            })
          )}
          <div style={{ marginTop: 12, opacity: 0.4, fontSize: '0.8rem' }}>
            Klik untuk lihat semua lirik ↗
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NowPlayingSidebar;
