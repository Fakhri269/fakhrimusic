import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { lyrics } from '../data/lyrics';

const FullPageLyrics = ({ currentSong, onClose }) => {
  const scrollRef = useRef(null);
  const [activeLine, setActiveLine] = useState(0);

  const songLyrics = lyrics[currentSong?.id] 
    ? lyrics[currentSong.id].split('\n') 
    : ["Lirik tidak tersedia untuk lagu ini."];

  // Auto-scroll simulation (since we don't have real timestamps)
  useEffect(() => {
    if (songLyrics.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveLine(prev => {
        const next = (prev + 1) % songLyrics.length;
        // Scroll the container slightly
        if (scrollRef.current) {
          const lines = scrollRef.current.children;
          if (lines[next]) {
            lines[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        return next;
      });
    }, 4000); // Highlight a new line every 4 seconds roughly

    return () => clearInterval(interval);
  }, [songLyrics]);

  if (!currentSong) return null;

  return (
    <div className="full-page-lyrics">
      <div 
        className="fpl-background" 
        style={{ backgroundImage: `url(${currentSong.cover})` }}
      />
      
      <div className="fpl-content">
        <div className="fpl-left">
          <div className="fpl-header">
            <button className="fpl-close-btn" onClick={onClose} aria-label="Minimize">
              <ChevronDown size={24} />
            </button>
          </div>
          <img src={currentSong.cover} alt={currentSong.title} className="fpl-cover" />
        </div>
        
        <div className="fpl-right">
          <div className="fpl-lyrics-container" ref={scrollRef}>
            {songLyrics.map((line, index) => (
              <div 
                key={index} 
                className={`fpl-line ${index === activeLine ? 'active' : ''}`}
                onClick={() => {
                  setActiveLine(index);
                  if (scrollRef.current && scrollRef.current.children[index]) {
                    scrollRef.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageLyrics;
