import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, Check, ArrowRight } from 'lucide-react';
import '../onboarding.css';

const AVAILABLE_GENRES = [
  { id: 'Pop', name: 'Pop', color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', image: 'https://upload.wikimedia.org/wikipedia/en/0/08/Justin_Bieber_-_Justice.png' },
  { id: 'R&B', name: 'R&B', color: 'linear-gradient(135deg, #845EC2, #D65DB1)', image: 'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_Blinding_Lights.png' },
  { id: 'Indie Pop', name: 'Indie Pop', color: 'linear-gradient(135deg, #00C9A7, #0089BA)', image: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/52/Nadin_Amizah_-_Untuk_Dunia%2C_Cinta%2C_dan_Kotornya.jpg/220px-Nadin_Amizah_-_Untuk_Dunia%2C_Cinta%2C_dan_Kotornya.jpg' },
  { id: 'Acoustic', name: 'Acoustic', color: 'linear-gradient(135deg, #FF9671, #FFC75F)', image: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png' },
  { id: 'Rock', name: 'Rock', color: 'linear-gradient(135deg, #D65DB1, #FF9671)', image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png' },
  { id: 'K-Pop', name: 'K-Pop', color: 'linear-gradient(135deg, #FFC75F, #F9F871)', image: 'https://upload.wikimedia.org/wikipedia/en/d/db/BTS_-_Butter.png' },
  { id: 'Jazz', name: 'Jazz', color: 'linear-gradient(135deg, #0089BA, #2C73D2)', image: 'https://upload.wikimedia.org/wikipedia/en/5/5b/Laufey_-_From_the_Start.png' },
  { id: 'Hip Hop', name: 'Hip Hop', color: 'linear-gradient(135deg, #B0A8B9, #4B4453)', image: 'https://upload.wikimedia.org/wikipedia/en/4/41/Lose_Yourself.jpg' }
];

const OnboardingPage = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const savedGenres = localStorage.getItem(`genres_${user.uid}`);
      if (savedGenres) {
        // Jika sudah milih, arahkan ke app
        navigate('/app', { replace: true });
      }
    }
  }, [user, navigate]);

  const toggleGenre = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genreId));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres([...selectedGenres, genreId]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length === 3 && user) {
      localStorage.setItem(`genres_${user.uid}`, JSON.stringify(selectedGenres));
      navigate('/app', { replace: true });
    }
  };

  if (!user) return null; // Wait for guard to handle if not logged in

  return (
    <div className="onboarding-page anim-fade-in">
      <div className="onboarding-bg"></div>
      
      <div className="onboarding-content anim-fade-up">
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <Music size={32} />
          </div>
          <h1>Pilih 3 Genre Favoritmu</h1>
          <p>Bantu kami mempersonalisasi berandamu dengan musik terbaik.</p>
        </div>

        <div className="genre-grid">
          {AVAILABLE_GENRES.map(genre => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <div 
                key={genre.id}
                className={`genre-card ${isSelected ? 'selected' : ''}`}
                style={{ 
                  background: genre.color, 
                  backgroundImage: `url(${genre.image})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
                onClick={() => toggleGenre(genre.id)}
              >
                <div className="genre-card-overlay"></div>
                <div className="genre-name">{genre.name}</div>
                {isSelected && (
                  <div className="genre-check">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="onboarding-footer">
          <div className="selection-count">
            {selectedGenres.length} / 3 dipilih
          </div>
          <button 
            className={`continue-btn ${selectedGenres.length === 3 ? 'active' : ''}`}
            onClick={handleContinue}
            disabled={selectedGenres.length !== 3}
          >
            Mulai Dengarkan <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
