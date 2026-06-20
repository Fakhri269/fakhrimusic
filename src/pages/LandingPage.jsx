import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Music, Headphones, ListMusic } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="glass-header">
        <div className="logo">
          <Music className="icon-primary" size={28} />
          <span>FakhriMusic</span>
        </div>
        <nav>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="gradient-text fade-in-up">
            Your Soundtrack, <br /> Everywhere You Go
          </h1>
          <p className="hero-subtitle fade-in-up delay-1">
            Immerse yourself in millions of songs, ad-free. Experience crystal clear audio and curated playlists crafted just for you.
          </p>
          <div className="cta-group fade-in-up delay-2">
            <Link to="/login" className="btn-primary btn-large">
              <Play fill="currentColor" size={20} /> Start Listening Free
            </Link>
            <button className="btn-secondary btn-large">Explore Plans</button>
          </div>
        </div>
        
        {/* Abstract Visuals */}
        <div className="hero-visual fade-in delay-3">
          <div className="floating-card card-1">
            <Headphones size={40} className="icon-accent" />
            <p>Lossless Audio</p>
          </div>
          <div className="floating-card card-2">
            <ListMusic size={40} className="icon-primary" />
            <p>Endless Playlists</p>
          </div>
          <div className="glow-sphere"></div>
        </div>
      </main>

      {/* Footer (Simple) */}
      <footer>
        <p>&copy; {new Date().getFullYear()} FakhriMusic. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
