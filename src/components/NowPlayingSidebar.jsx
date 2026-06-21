import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { lyrics } from '../data/lyrics';

const NowPlayingSidebar = ({ currentSong, onClose, onExpandLyrics }) => {
  if (!currentSong) return null;

  const songLyrics = lyrics[currentSong.id] 
    ? lyrics[currentSong.id].split('\n') 
    : ["Lirik tidak tersedia."];

  return (
    <aside className="right-sidebar">
      <div className="now-playing-header">
        <span>Now playing view</span>
        <button onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
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
          Mereka telah merilis berbagai lagu hits yang menduduki puncak tangga lagu global. 
          Lagu "{currentSong.title}" ini telah diputar lebih dari jutaan kali!
        </p>
      </div>

      <div 
        className="lyrics-card" 
        onClick={onExpandLyrics} 
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div className="lyrics-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Lyrics</span>
          <Maximize2 size={16} />
        </div>
        <div className="lyrics-content">
          {songLyrics.slice(0, 8).map((line, index) => (
            <div 
              key={index} 
              className={`lyrics-line ${index === 0 ? 'active' : ''}`}
            >
              {line}
            </div>
          ))}
          {songLyrics.length > 8 && (
            <div className="lyrics-line" style={{ marginTop: 8, opacity: 0.5, fontSize: '0.9rem' }}>
              Click to view full lyrics...
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default NowPlayingSidebar;
