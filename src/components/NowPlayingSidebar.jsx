import React from 'react';
import { X, Mic2 } from 'lucide-react';

const dummyLyrics = [
  "Sedang memuat lirik untuk lagu ini...",
  "Lirik disinkronisasikan",
  "♪ (Musik) ♪",
  "Oh yeah...",
  "This is a dummy lyrics section",
  "Because we don't have a real lyrics API",
  "But it looks exactly like Spotify's right?",
  "You can scroll through these lines",
  "And imagine you are singing along",
  "To your favorite song",
  "♪ (Chorus) ♪",
  "La la la la la",
  "Singing in the rain",
  "This is the best app ever",
  "FakhriMusic is awesome",
  "♪ (Outro) ♪",
];

const NowPlayingSidebar = ({ currentSong, onClose }) => {
  if (!currentSong) return null;

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

      <div className="lyrics-card">
        <div className="lyrics-card-header">Lyrics</div>
        <div className="lyrics-content">
          {dummyLyrics.map((line, index) => (
            <div 
              key={index} 
              className={`lyrics-line ${index === 3 || index === 4 ? 'active' : ''}`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default NowPlayingSidebar;
