import React from 'react';
import { Link } from 'react-router-dom';
import {
  Music2, Play, SkipBack, SkipForward, Shuffle, Repeat,
  Heart, Volume2, Headphones, ListMusic, Zap, Globe,
  CheckCircle2, ChevronRight, Apple, Smartphone
} from 'lucide-react';

import { songs } from '../data/songs';

const albumUrls = songs.slice(0, 16).map(s => s.cover);
// if less than 16, repeat
while (albumUrls.length < 16) {
  albumUrls.push(...albumUrls.slice(0, 16 - albumUrls.length));
}

const marqueeItems = [
  { title: 'Blinding Lights', artist: 'The Weeknd', img: songs[0]?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
  { title: 'As It Was', artist: 'Harry Styles', img: songs[1]?.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop' },
  { title: 'Levitating', artist: 'Dua Lipa', img: songs[2]?.cover || 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?w=200&h=200&fit=crop' },
  { title: 'Stay', artist: 'Kid LAROI', img: songs[3]?.cover || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop' },
  { title: 'Peaches', artist: 'Justin Bieber', img: songs[4]?.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop' },
  { title: 'Butter', artist: 'BTS', img: songs[5]?.cover || 'https://images.unsplash.com/photo-1506157786151-b849c5307c65?w=200&h=200&fit=crop' },
  { title: 'Good 4 U', artist: 'Olivia Rodrigo', img: songs[6]?.cover || 'https://images.unsplash.com/photo-1490227931327-0c7f1a3070cd?w=200&h=200&fit=crop' },
  { title: 'Montero', artist: 'Lil Nas X', img: songs[7]?.cover || 'https://images.unsplash.com/photo-1470229722913-7c090be5c5b5?w=200&h=200&fit=crop' },
];

const LandingPage = () => {
  const handleInstall = () => {
    alert("FakhriMusic adalah Web App PWA! Di Chrome/Safari HP kamu, pilih menu 'Tambahkan ke Layar Utama' (Add to Home Screen) untuk menginstalnya sebagai aplikasi.");
  };

  return (
    <div className="landing anim-fade-in">
      {/* ── NAV ── */}
      <nav className="landing-nav anim-fade">
        <div className="nav-logo">
          <Music2 size={26} />
          FakhriMusic
        </div>
        <div className="nav-actions">
          <a href="#plans" className="nav-link">Premium</a>
          <a href="#features" className="nav-link">Features</a>
          <Link to="/login" className="btn-ghost" style={{ padding: '10px 24px', fontSize: '0.875rem' }}>
            Log in
          </Link>
          <Link to="/login" className="btn-white" style={{ padding: '10px 24px', fontSize: '0.875rem' }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-bg-gradient" />
          <div className="hero-bg-noise" />
        </div>

        <div className="hero-inner">
          {/* Left: Text */}
          <div className="hero-content">
            <div className="hero-badge anim-fade-up">
              <span className="hero-badge-dot" />
              Now streaming — 80M+ tracks
            </div>

            <h1 className="hero-title anim-fade-up delay-100">
              Music for <span className="accent-word">every</span><br />
              mood &amp; moment
            </h1>

            <p className="hero-sub anim-fade-up delay-200">
              FakhriMusic gives you instant access to millions of songs, albums, and podcasts. Listen free, no credit card required.
            </p>

            <div className="hero-cta anim-fade-up delay-300">
              <Link to="/login" className="btn-green" style={{ fontSize: '1rem', padding: '16px 40px' }}>
                <Play size={18} fill="currentColor" />
                Get started free
              </Link>
              <a href="#plans" className="btn-ghost" style={{ fontSize: '1rem', padding: '16px 40px' }}>
                Explore Premium <ChevronRight size={16} />
              </a>
            </div>
            
            <div className="hero-downloads anim-fade-up delay-300" style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button className="btn-ghost" onClick={handleInstall} style={{ fontSize: '0.9rem', padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Apple size={20} fill="currentColor" />
                Download for iOS
              </button>
              <button className="btn-ghost" onClick={handleInstall} style={{ fontSize: '0.9rem', padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Smartphone size={20} />
                Download for Android
              </button>
            </div>

            <div className="hero-stats anim-fade-up delay-400">
              <div className="stat-item">
                <div className="stat-num">80M+</div>
                <div className="stat-label">Songs</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">190+</div>
                <div className="stat-label">Countries</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">4M+</div>
                <div className="stat-label">Podcasts</div>
              </div>
            </div>
          </div>

          {/* Right: Player Mockup */}
          <div className="hero-visual anim-fade delay-300">
            <div className="player-glow" />

            {/* Floating mini card — friends */}
            <div className="float-card float-card-friends">
              <div className="float-card-label">Friends listening</div>
              <div className="friend-list">
                {[11,12,13,14].map(s => (
                  <div className="friend-avatar" key={s}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${s}&backgroundColor=1ed760`} alt="" />
                  </div>
                ))}
                <div className="friend-avatar" style={{ background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-subdued)', fontWeight: 700 }}>
                  +24
                </div>
              </div>
            </div>

            {/* Player card */}
            <div className="player-mockup">
              <div className="player-card">
                <div className="player-album">
                  <img src={songs[10]?.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'} alt="Album Art" onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=album1&backgroundColor=1ed760`; }} />
                  <div className="album-play-overlay">
                    <div className="album-play-btn">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="player-meta">
                  <div>
                    <div className="player-track-name">{songs[10]?.title || 'Midnight Serenade'}</div>
                    <div className="player-artist-name">{songs[10]?.artist || 'Luna Waves'}</div>
                  </div>
                  <Heart size={20} className="player-heart" fill="#1ed760" />
                </div>

                <div className="player-progress">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" />
                  </div>
                  <div className="progress-times">
                    <span>1:24</span>
                    <span>3:51</span>
                  </div>
                </div>

                <div className="player-controls">
                  <div className="ctrl-btn"><Shuffle size={16} /></div>
                  <div className="ctrl-btn"><SkipBack size={18} /></div>
                  <div className="ctrl-btn-play">
                    <Play size={22} fill="currentColor" />
                  </div>
                  <div className="ctrl-btn"><SkipForward size={18} /></div>
                  <div className="ctrl-btn"><Repeat size={16} /></div>
                </div>

                {/* Volume row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                  <Volume2 size={14} style={{ color: 'var(--text-subdued)' }} />
                  <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '70%', background: 'var(--text-subdued)', borderRadius: 2 }} />
                  </div>
                  {/* Wave bars playing indicator */}
                  <div className="wave-bars">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="wave-bar" style={{ height: `${8 + i * 4}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini card — top track */}
            <div className="float-card float-card-top">
              <div className="float-card-label">#1 Trending Now</div>
              <div className="top-track-item">
                <div className="top-track-rank">1</div>
                <div className="top-track-thumb">
                  <img src="https://picsum.photos/seed/top1/80/80" alt="" onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=top1&backgroundColor=1ed760`; }} />
                </div>
                <div>
                  <div className="top-track-name">Blinding Lights</div>
                  <div className="top-track-artist">The Weeknd</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <React.Fragment key={i}>
              <div className="marquee-item">
                <div className="marquee-album">
                  <img src={item.img} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=mq${i}&backgroundColor=1ed760`; }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{item.title}</div>
                  <div className="marquee-text">{item.artist}</div>
                </div>
              </div>
              <div className="marquee-dot" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="section-label anim-fade-up">Why FakhriMusic</div>
        <h2 className="section-title anim-fade-up delay-100">
          Everything you need,<br />nothing you don't.
        </h2>

        <div className="features-grid">
          {[
            {
              icon: <Headphones size={24} />,
              title: 'Hi-Fi Audio Quality',
              desc: 'Lossless audio up to 320kbps. Hear every detail your favourite artists intended. Crystal clear sound on any device.'
            },
            {
              icon: <ListMusic size={24} />,
              title: 'Smart Playlists',
              desc: 'AI-powered playlists that learn your taste over time. Get personalized recommendations that actually make sense.'
            },
            {
              icon: <Zap size={24} />,
              title: 'Instant Streaming',
              desc: 'Zero buffering, instant playback. Our global CDN ensures your music starts playing the moment you press play.'
            },
            {
              icon: <Globe size={24} />,
              title: 'Offline Mode',
              desc: 'Download up to 10,000 songs for offline listening. Your music goes wherever you go, internet or not.'
            },
            {
              icon: <Heart size={24} />,
              title: 'Artist Support',
              desc: 'We pay artists fairly. Every stream directly supports the creators who make the music you love.'
            },
            {
              icon: <Music2 size={24} />,
              title: '80M+ Songs',
              desc: 'From underground indie to global charts. Every genre, every era, every mood — all in one place.'
            },
          ].map((f, i) => (
            <div className={`feature-card anim-fade-up delay-${(i % 3 + 1) * 100}`} key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="plans" id="plans">
        <div className="plans-inner">
          <div className="plans-header">
            <div className="section-label">Pricing</div>
            <h2 className="section-title" style={{ maxWidth: '100%', textAlign: 'center', margin: '0 auto 0' }}>
              Music without limits
            </h2>
          </div>

          <div className="plans-grid">
            {/* Free */}
            <div className="plan-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">Rp 0<span>/mo</span></div>
              <div className="plan-period">No credit card needed</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {['Ad-supported listening', 'Shuffle mode only', 'Basic audio quality', 'Mobile only'].map(f => (
                  <li key={f}><CheckCircle2 size={16} />{f}</li>
                ))}
              </ul>
              <Link to="/login" className="plan-btn">Get started</Link>
            </div>

            {/* Premium — featured */}
            <div className="plan-card plan-featured">
              <div className="plan-featured-badge">Most Popular</div>
              <div className="plan-name">Premium</div>
              <div className="plan-price">Rp 54.990<span>/mo</span></div>
              <div className="plan-period">Billed monthly, cancel anytime</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {['Ad-free music', 'Download 10,000 songs', 'Hi-Fi 320kbps audio', 'All devices', 'Unlimited skips'].map(f => (
                  <li key={f}><CheckCircle2 size={16} />{f}</li>
                ))}
              </ul>
              <Link to="/login" className="plan-btn">Try 1 month free</Link>
            </div>

            {/* Family */}
            <div className="plan-card">
              <div className="plan-name">Family</div>
              <div className="plan-price">Rp 89.990<span>/mo</span></div>
              <div className="plan-period">Up to 6 accounts</div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {['6 Premium accounts', 'Parental controls', 'Family Mix playlist', 'Ad-free for all'].map(f => (
                  <li key={f}><CheckCircle2 size={16} />{f}</li>
                ))}
              </ul>
              <Link to="/login" className="plan-btn">Get started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo" style={{ marginBottom: 12 }}>
                <Music2 size={22} style={{ color: 'var(--accent)' }} /> FakhriMusic
              </div>
              <p>Music for every mood, delivered with the best audio quality on any device.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <div className="footer-col-title">Company</div>
                <ul>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Jobs</a></li>
                  <li><a href="#">Press</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Communities</div>
                <ul>
                  <li><a href="#">For Artists</a></li>
                  <li><a href="#">Developers</a></li>
                  <li><a href="#">Brands</a></li>
                  <li><a href="#">Investors</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Useful Links</div>
                <ul>
                  <li><a href="#">Support</a></li>
                  <li><a href="#">Free Mobile App</a></li>
                  <li><a href="#">Desktop App</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} FakhriMusic. All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="#">Legal</a>
              <a href="#">Privacy Center</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
