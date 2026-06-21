import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Music } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

function fmt(s) {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sc = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sc}`;
}

function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n')
    .map(line => {
      const m = line.match(/^\[(\d+):(\d+\.\d+)\]\s*(.*)/);
      if (!m) return null;
      const text = m[3].trim();
      if (!text) return null;
      return { time: parseInt(m[1]) * 60 + parseFloat(m[2]), text };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  if (lines.length === 0) return [];

  const processed = [];
  // Intro interlude marker if gap > 5 seconds
  if (lines[0].time > 5) {
    processed.push({ time: 0, text: "", isInterlude: true });
  }

  for (let i = 0; i < lines.length - 1; i++) {
    processed.push(lines[i]);
    const gap = lines[i+1].time - lines[i].time;
    // Insert interlude if gap between words is > 15 seconds
    if (gap > 15) {
      processed.push({ time: lines[i].time + 5, text: "", isInterlude: true });
    }
  }
  processed.push(lines[lines.length - 1]);
  return processed;
}

const FullPageLyrics = ({ currentSong, onClose }) => {
  const { 
    currentTime, duration, isPlaying, togglePlay, handleNext, handlePrev, 
    seekTo, isShuffled, toggleShuffle, repeatMode, toggleRepeat 
  } = useMusic();
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

      <div className="sp-fpl-wrapper">
        {/* DESKTOP: Left Side (Album Art & Info) */}
        <div className="sp-fpl-desktop-left">
           <button className="sp-fpl-close-btn desktop-close" onClick={onClose}>
             <ChevronDown size={32} />
           </button>
           <img src={currentSong.cover} alt={currentSong.title} className="sp-fpl-cover-img" />
           <div className="sp-fpl-title">{currentSong.title}</div>
           <div className="sp-fpl-artist">{currentSong.artist}</div>
        </div>

        {/* MOBILE: Topbar & Player Elements (Hidden on Desktop) */}
        <div className="sp-fpl-mobile-player">
          {/* 1. Topbar */}
          <div className="sp-fpl-topbar">
            <button className="sp-fpl-close-btn" onClick={onClose}>
              <ChevronLeft size={28} />
            </button>
            <div className="sp-fpl-top-text">PLAYING FROM SEARCH</div>
            <div style={{ width: 28 }} />
          </div>

          {/* 2. Cover Art */}
          <div className="sp-fpl-cover-area">
            <img src={currentSong.cover} alt={currentSong.title} className="sp-fpl-cover-img" />
          </div>

          {/* 3. Info Area */}
          <div className="sp-fpl-info-area">
            <div className="sp-fpl-meta">
              <div className="sp-fpl-title">{currentSong.title}</div>
              <div className="sp-fpl-artist">{currentSong.artist}</div>
            </div>
          </div>

          {/* 4. Controls Area */}
          <div className="sp-fpl-controls-area">
            <div className="sp-progress">
              <span className="sp-time">{fmt(currentTime)}</span>
              <div className="sp-progress-track"
                onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
                <div className="sp-progress-fill" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
              </div>
              <span className="sp-time">{fmt(duration)}</span>
            </div>
            
            <div className="sp-fpl-mobile-btns">
              <button className={`sp-ctrl ${isShuffled ? 'active' : ''}`} onClick={toggleShuffle}>
                <Shuffle size={24} />
              </button>
              <button className="sp-ctrl" onClick={handlePrev}><SkipBack size={32} fill="currentColor" /></button>
              <button className="sp-ctrl sp-ctrl-play" style={{ width: 64, height: 64, backgroundColor: '#fff', color: '#000', borderRadius: '50%' }} onClick={togglePlay}>
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 4 }} />}
              </button>
              <button className="sp-ctrl" onClick={handleNext}><SkipForward size={32} fill="currentColor" /></button>
              <button className={`sp-ctrl ${repeatMode !== 'none' ? 'active' : ''}`} onClick={toggleRepeat}>
                <Repeat size={24} />
                {repeatMode === 'one' && (
                  <span style={{ position: 'absolute', bottom: -4, right: -2, fontSize: '0.65rem', fontWeight: 900, color: 'var(--sp-green)' }}>1</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* BOTH: Lyrics Area */}
        <div className="sp-fpl-lyrics-area">
          <div className="sp-fpl-lyrics-header">Lyrics</div>
          {loading ? (
            <div className="sp-fpl-lyrics-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="sp-fpl-loading">Loading lyrics...</div>
            </div>
          ) : lyricsData.length === 0 ? (
            <div className="sp-fpl-lyrics-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="sp-fpl-loading">No lyrics available</div>
            </div>
          ) : (
            <div className="sp-fpl-lyrics-scroll">
              <div className="sp-fpl-lines">
                {lyricsData.map((line, i) => (
                  <div
                    key={i}
                    ref={i === activeLine ? activeRef : null}
                    className={`sp-fpl-line ${i === activeLine ? 'active' : ''}`}
                    onClick={() => seekTo(line.time)}
                  >
                    {line.isInterlude ? <Music size={32} /> : line.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FullPageLyrics;
