import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music2, Search, Home, Heart, ListMusic, LogOut, Play,
  SkipBack, SkipForward, Shuffle, Repeat, Volume2,
  ChevronRight, Mic2, Radio, TrendingUp, User, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const formatPlays = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n;
};

const AppPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    songs, currentSong, isPlaying,
    currentTime, duration, volume,
    playSong, togglePlay, handleNext, handlePrev,
    seekTo, setVolume, toggleShuffle, toggleRepeat,
    isShuffled, repeatMode, toggleLike, isLiked,
  } = useMusic();

  const [activeNav, setActiveNav] = useState('home');
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const featured = songs.slice(0, 6);
  const trending = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 5);

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Music2 size={24} />
          <span>FakhriMusic</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => setActiveNav('home')}
          >
            <Home size={20} /> Beranda
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'search' ? 'active' : ''}`}
            onClick={() => setActiveNav('search')}
          >
            <Search size={20} /> Cari
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveNav('liked')}
          >
            <Heart size={20} /> Disukai
          </button>
          <button
            className={`sidebar-nav-item ${activeNav === 'playlist' ? 'active' : ''}`}
            onClick={() => setActiveNav('playlist')}
          >
            <ListMusic size={20} /> Playlist
          </button>
        </nav>

        {/* User profile */}
        <div className="sidebar-user">
          {user?.photoURL
            ? <img src={user.photoURL} alt={user.displayName} className="sidebar-avatar" />
            : (
              <div className="sidebar-avatar-placeholder">
                <User size={16} />
              </div>
            )
          }
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="app-main">
        {/* Top bar */}
        <div className="app-topbar">
          <div className="app-search-wrap">
            <Search size={18} className="app-search-icon" />
            <input
              type="text"
              className="app-search-input"
              placeholder="Cari lagu, artis, album..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value) setActiveNav('search');
                else setActiveNav('home');
              }}
            />
          </div>
          <div className="app-topbar-right">
            <span className="app-greeting">
              Halo, {user?.displayName?.split(' ')[0] || 'User'} 👋
            </span>
            {user?.photoURL && (
              <img src={user.photoURL} className="topbar-avatar" alt="" />
            )}
          </div>
        </div>

        <div className="app-scroll">
          {/* SEARCH VIEW */}
          {activeNav === 'search' && (
            <section className="app-section">
              <h2 className="section-h2">Hasil pencarian "{search}"</h2>
              <div className="song-list">
                <SongListHeader />
                {filtered.length === 0
                  ? <p style={{ color: 'var(--text-subdued)', padding: '24px 0' }}>Tidak ada lagu ditemukan.</p>
                  : filtered.map((song, i) => (
                    <SongRow key={song.id} song={song} index={i} onPlay={() => playSong(song, filtered)} isPlaying={isPlaying && currentSong?.id === song.id} isLiked={isLiked(song.id)} onLike={() => toggleLike(song.id)} />
                  ))
                }
              </div>
            </section>
          )}

          {/* LIKED VIEW */}
          {activeNav === 'liked' && (
            <section className="app-section">
              <h2 className="section-h2">Lagu yang Disukai</h2>
              <div className="song-list">
                <SongListHeader />
                {songs.filter(s => isLiked(s.id)).length === 0
                  ? <p style={{ color: 'var(--text-subdued)', padding: '24px 0' }}>Kamu belum menyukai lagu apapun.</p>
                  : songs.filter(s => isLiked(s.id)).map((song, i) => (
                    <SongRow key={song.id} song={song} index={i} onPlay={() => playSong(song, songs.filter(s => isLiked(s.id)))} isPlaying={isPlaying && currentSong?.id === song.id} isLiked={isLiked(song.id)} onLike={() => toggleLike(song.id)} />
                  ))
                }
              </div>
            </section>
          )}

          {/* HOME VIEW */}
          {activeNav === 'home' && (
            <>
              {/* Hero greeting */}
              <div className="app-hero-greeting">
                <div>
                  <h1 className="app-hero-title">
                    {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Pendengar'}!
                  </h1>
                  <p className="app-hero-sub">Apa yang ingin kamu dengarkan hari ini?</p>
                </div>
                <div className="app-hero-quick">
                  {[{icon: <Radio size={18}/>, label:'Radio'},{icon:<TrendingUp size={18}/>, label:'Charts'},{icon:<Mic2 size={18}/>, label:'Podcast'}].map(q => (
                    <div className="quick-chip" key={q.label}>{q.icon}{q.label}</div>
                  ))}
                </div>
              </div>

              {/* Featured grid */}
              <section className="app-section">
                <div className="section-row">
                  <h2 className="section-h2">Rekomendasi Untukmu</h2>
                  <button className="see-all">Lihat semua <ChevronRight size={14}/></button>
                </div>
                <div className="featured-grid">
                  {featured.map(song => (
                    <div
                      key={song.id}
                      className={`featured-card ${currentSong?.id === song.id ? 'featured-card-active' : ''}`}
                      onClick={() => playSong(song, featured)}
                    >
                      <div className="featured-cover">
                        <img src={song.cover} alt={song.title} />
                        <div className="featured-play-overlay">
                          <div className="featured-play-btn">
                            <Play size={22} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="featured-title">{song.title}</div>
                      <div className="featured-artist">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending */}
              <section className="app-section">
                <div className="section-row">
                  <h2 className="section-h2">Trending Sekarang</h2>
                  <button className="see-all">Lihat semua <ChevronRight size={14}/></button>
                </div>
                <div className="song-list">
                  <SongListHeader />
                  {trending.map((song, i) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i}
                      onPlay={() => playSong(song, trending)}
                      isPlaying={isPlaying && currentSong?.id === song.id}
                      isLiked={isLiked(song.id)}
                      onLike={() => toggleLike(song.id)}
                    />
                  ))}
                </div>
              </section>

              {/* All songs */}
              <section className="app-section">
                <div className="section-row">
                  <h2 className="section-h2">Semua Lagu</h2>
                  <span style={{ color: 'var(--text-subdued)', fontSize: '0.875rem' }}>{songs.length} lagu</span>
                </div>
                <div className="song-list">
                  <SongListHeader />
                  {songs.map((song, i) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i}
                      onPlay={() => playSong(song, songs)}
                      isPlaying={isPlaying && currentSong?.id === song.id}
                      isLiked={isLiked(song.id)}
                      onLike={() => toggleLike(song.id)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* ── PLAYER BAR ── */}
      {currentSong && (
        <div className="player-bar">
          {/* Track info */}
          <div className="player-bar-track">
            <img src={currentSong.cover} alt={currentSong.title} className="player-bar-cover" />
            <div className="player-bar-meta">
              <div className="player-bar-title">{currentSong.title}</div>
              <div className="player-bar-artist">{currentSong.artist}</div>
            </div>
            <button
              className={`player-bar-heart ${isLiked(currentSong.id) ? 'liked' : ''}`}
              onClick={() => toggleLike(currentSong.id)}
            >
              <Heart size={18} fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Controls */}
          <div className="player-bar-center">
            <div className="player-bar-controls">
              <button
                className={`bar-ctrl ${isShuffled ? 'bar-ctrl-active' : ''}`}
                onClick={toggleShuffle}
              ><Shuffle size={16}/></button>
              <button className="bar-ctrl" onClick={handlePrev}><SkipBack size={18}/></button>
              <button className="bar-ctrl-play" onClick={togglePlay}>
                {isPlaying
                  ? <span style={{ fontSize: 22, lineHeight: 1 }}>⏸</span>
                  : <Play size={20} fill="currentColor" />
                }
              </button>
              <button className="bar-ctrl" onClick={handleNext}><SkipForward size={18}/></button>
              <button
                className={`bar-ctrl ${repeatMode !== 'none' ? 'bar-ctrl-active' : ''}`}
                onClick={toggleRepeat}
              >
                <Repeat size={16}/>
                {repeatMode === 'one' && <span className="repeat-one-badge">1</span>}
              </button>
            </div>
            <div className="player-bar-progress">
              <span className="bar-time">{formatTime(currentTime)}</span>
              <div
                className="bar-progress-bg"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seekTo(((e.clientX - rect.left) / rect.width) * duration);
                }}
              >
                <div
                  className="bar-progress-fill"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="bar-time">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="player-bar-volume">
            <Volume2 size={16} style={{ color: 'var(--text-subdued)', flexShrink: 0 }} />
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Song List Header Component ──
const SongListHeader = () => (
  <div className="song-row song-list-header">
    <div className="song-row-num">#</div>
    <div className="song-row-info" style={{ paddingLeft: 16 }}>Judul</div>
    <div className="song-row-album">Album</div>
    <div className="song-row-plays">Diputar</div>
    <div className="song-row-heart"></div>
    <div className="song-row-duration" style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8 }}>
      <Clock size={16} />
    </div>
  </div>
);

// ── Song Row Component ──
const SongRow = ({ song, index, onPlay, isPlaying, isLiked, onLike }) => (
  <div className={`song-row ${isPlaying ? 'song-row-active' : ''}`} onClick={onPlay}>
    <div className="song-row-num">
      {isPlaying
        ? <span className="song-row-wave"><span/><span/><span/></span>
        : (
          <>
            <span className="song-row-index">{index + 1}</span>
            <span className="song-row-play"><Play size={14} fill="currentColor" /></span>
          </>
        )
      }
    </div>
    <img src={song.cover} alt={song.title} className="song-row-cover" />
    <div className="song-row-info">
      <div className="song-row-title">{song.title}</div>
      <div className="song-row-artist">{song.artist}</div>
    </div>
    <div className="song-row-album">{song.album}</div>
    <div className="song-row-plays">{formatPlays(song.plays)}</div>
    <button
      className={`song-row-heart ${isLiked ? 'liked' : ''}`}
      onClick={e => { e.stopPropagation(); onLike(); }}
    >
      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
    </button>
    <div className="song-row-duration">
      {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
    </div>
  </div>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 17) return 'Selamat siang';
  if (h < 21) return 'Selamat sore';
  return 'Selamat malam';
};

export default AppPage;
