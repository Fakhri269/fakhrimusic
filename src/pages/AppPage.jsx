import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music2, Search, Home, Heart, ListMusic, LogOut, Play, Pause,
  SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX,
  ChevronRight, Mic2, Library, Plus, Radio, TrendingUp, User, Clock, X,
  Trophy, Sparkles, Podcast, Zap, Flame, Guitar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import NowPlayingSidebar from '../components/NowPlayingSidebar';
import FullPageLyrics from '../components/FullPageLyrics';

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const fmtPlays = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n;
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 17) return 'Selamat siang';
  if (h < 21) return 'Selamat sore';
  return 'Selamat malam';
};

const QUICK = [
  { color: '#e91429', bg: '#450d10', label: 'Top Charts', icon: <Trophy size={20} /> },
  { color: '#1e3264', bg: '#0d1b38', label: 'New Releases', icon: <Sparkles size={20} /> },
  { color: '#8d67ab', bg: '#2a1a3d', label: 'Podcasts', icon: <Podcast size={20} /> },
  { color: '#e8115b', bg: '#45062e', label: 'Pop', icon: <Zap size={20} /> },
  { color: '#1e8c45', bg: '#0a2e18', label: 'Hip-Hop', icon: <Flame size={20} /> },
  { color: '#ba5d07', bg: '#3d1e02', label: 'R&B', icon: <Guitar size={20} /> },
];

// ── Song Row ──────────────────────────────────────────────────────────────
const SongRow = ({ song, index, onPlay, isActive, isPlaying, isLiked, onLike }) => (
  <div className={`sp-song-row ${isActive ? 'active' : ''}`} onClick={onPlay}>
    <div className="sp-song-num">
      {isPlaying ? (
        <span className="sp-wave"><span/><span/><span/></span>
      ) : (
        <>
          <span className="num">{index + 1}</span>
          <span className="play-icon"><Play size={14} fill="currentColor" /></span>
        </>
      )}
    </div>

    <div className="sp-song-info">
      <img src={song.cover} alt={song.title} className="sp-song-cover" />
      <div className="sp-song-meta">
        <div className="sp-song-title">{song.title}</div>
        <div className="sp-song-artist">{song.artist}</div>
      </div>
    </div>

    <div className="sp-song-album">{song.album}</div>
    <div className="sp-song-plays">{fmtPlays(song.plays)}</div>

    <div className="sp-song-end">
      <button
        className={`sp-song-heart ${isLiked ? 'liked' : ''}`}
        onClick={e => { e.stopPropagation(); onLike(); }}
      >
        <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
      </button>
      <span className="sp-song-duration">
        {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
      </span>
    </div>
  </div>
);

// ── Song Header ───────────────────────────────────────────────────────────
const SongHeader = () => (
  <div className="sp-song-header">
    <div>#</div>
    <div style={{ paddingLeft: 52 }}>JUDUL</div>
    <div>ALBUM</div>
    <div>DIPUTAR</div>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Clock size={14} /></div>
  </div>
);

// ── Album / Artist Card ────────────────────────────────────────────────────
const Card = ({ song, isPlaying, isActive, onPlay }) => (
  <div className={`sp-card ${isActive ? 'playing' : ''}`} onClick={onPlay}>
    <div className="sp-card-img-wrap">
      <img src={song.cover} alt={song.title} className="sp-card-img" />
      <button className="sp-card-play-btn" onClick={e => { e.stopPropagation(); onPlay(); }}>
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
    </div>
    <div className="sp-card-name">{song.title}</div>
    <div className="sp-card-sub">{song.artist}</div>
  </div>
);

// ── Main AppPage ──────────────────────────────────────────────────────────
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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  React.useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(search)}&entity=song&limit=20`)
        .then(r => r.json())
        .then(data => {
          if (data && data.results) {
            const mapped = data.results.map(t => ({
              id: `itunes_${t.trackId}`,
              title: t.trackName,
              artist: t.artistName,
              album: t.collectionName,
              cover: t.artworkUrl100.replace('100x100bb', '500x500bb'),
              duration: Math.floor(t.trackTimeMillis / 1000) || 180,
              youtubeId: null,
              startSeconds: 0,
              plays: Math.floor(Math.random() * 5000000) + 100000,
              genre: t.primaryGenreName,
            }));
            setSearchResults(mapped);
          }
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);
  const featured  = songs.slice(0, 6);
  const trending  = [...songs].sort((a, b) => b.plays - a.plays).slice(0, 6);
  const likedList = songs.filter(s => isLiked(s.id));

  const openLyrics = () => { setIsNowPlayingOpen(false); setIsLyricsOpen(true); };
  const closeLyrics = () => { setIsLyricsOpen(false); setIsNowPlayingOpen(true); };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="sp-layout">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="sp-sidebar">
        <div className="sp-sidebar-logo">
          <Music2 size={28} />
          <span>FakhriMusic</span>
        </div>

        <nav className="sp-nav">
          {[
            { key: 'home',     icon: <Home size={22} />,      label: 'Beranda' },
            { key: 'search',   icon: <Search size={22} />,    label: 'Cari' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              className={`sp-nav-item ${activeNav === key ? 'active' : ''}`}
              onClick={() => setActiveNav(key)}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        {/* Library */}
        <div className="sp-sidebar-library">
          <div className="sp-library-header">
            <div className="sp-library-title">
              <Library size={18} />
              <span>Library</span>
            </div>
            <button className="sp-library-add" title="Tambah playlist"><Plus size={18} /></button>
          </div>

          {/* Nav items inside library */}
          {[
            { key: 'liked',    icon: <Heart size={18} />,       label: 'Lagu Disukai',  sub: 'Playlist • ' + likedList.length + ' lagu' },
            { key: 'playlist', icon: <ListMusic size={18} />,   label: 'My Playlist',   sub: 'Playlist' },
          ].map(({ key, icon, label, sub }) => (
            <div
              key={key}
              className={`sp-playlist-item ${activeNav === key ? 'active' : ''}`}
              onClick={() => setActiveNav(key)}
            >
              <div className="sp-playlist-cover-placeholder">{icon}</div>
              <div className="sp-playlist-info">
                <div className="name">{label}</div>
                <div className="sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* User profile at bottom */}
        <div className="sp-sidebar-user">
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="sp-user-avatar" />
            : <div className="sp-user-avatar-ph"><User size={14} /></div>
          }
          <span className="sp-user-name">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
          <button className="sp-logout-btn" onClick={handleLogout} title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="sp-main">
        {/* Topbar */}
        <div className="sp-topbar">
          <div className="sp-search-wrap">
            <Search size={16} color="#b3b3b3" />
            <input
              type="text"
              className="sp-search-input"
              placeholder="Cari lagu atau artis..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveNav(e.target.value ? 'search' : 'home'); }}
            />
          </div>
          <div className="sp-topbar-right">
            <span className="sp-topbar-greeting">
              Halo, {user?.displayName?.split(' ')[0] || 'Pendengar'}!
            </span>
            {user?.photoURL && <img src={user.photoURL} className="sp-topbar-avatar" alt="" />}
          </div>
        </div>

        <div className="sp-scroll">
          {/* ── SEARCH VIEW ── */}
          {activeNav === 'search' && (
            <section className="sp-section">
              <h2 className="sp-section-title" style={{ marginBottom: 16 }}>
                {search ? `Hasil untuk "${search}"` : 'Pencarian'}
              </h2>
              <SongHeader />
              {isSearching ? (
                 <p style={{ color: '#b3b3b3', padding: '24px 0' }}>Mencari lagu...</p>
              ) : searchResults.length === 0 && search.trim() ? (
                 <p style={{ color: '#b3b3b3', padding: '24px 0' }}>Tidak ada lagu ditemukan.</p>
              ) : searchResults.length > 0 ? (
                 searchResults.map((song, i) => (
                   <SongRow key={song.id} song={song} index={i}
                     onPlay={() => String(currentSong?.id) === String(song.id) ? togglePlay() : playSong(song, searchResults)}
                     isActive={String(currentSong?.id) === String(song.id)}
                     isPlaying={isPlaying && String(currentSong?.id) === String(song.id)}
                     isLiked={isLiked(song.id)} onLike={() => toggleLike(song.id)} />
                 ))
              ) : (
                 <p style={{ color: '#b3b3b3', padding: '24px 0' }}>Ketik judul atau nama artis untuk mulai mencari jutaan lagu!</p>
              )}
            </section>
          )}

          {/* ── LIKED VIEW ── */}
          {activeNav === 'liked' && (
            <section className="sp-section">
              <h2 className="sp-section-title" style={{ marginBottom: 16 }}>Lagu yang Disukai</h2>
              <SongHeader />
              {likedList.length === 0
                ? <p style={{ color: '#b3b3b3', padding: '24px 0' }}>Belum ada lagu yang disukai.</p>
                : likedList.map((song, i) => (
                  <SongRow key={song.id} song={song} index={i}
                    onPlay={() => currentSong?.id === song.id ? togglePlay() : playSong(song, likedList)}
                    isActive={currentSong?.id === song.id}
                    isPlaying={isPlaying && currentSong?.id === song.id}
                    isLiked={isLiked(song.id)} onLike={() => toggleLike(song.id)} />
                ))
              }
            </section>
          )}

          {/* ── PLAYLIST VIEW ── */}
          {activeNav === 'playlist' && (
            <section className="sp-section">
              <h2 className="sp-section-title" style={{ marginBottom: 16 }}>My Playlist</h2>
              <p style={{ color: '#b3b3b3' }}>Fitur playlist segera hadir.</p>
            </section>
          )}

          {/* ── PROFILE VIEW ── */}
          {activeNav === 'profile' && (
            <section className="sp-section sp-profile-section">
              {/* Profile Header */}
              <div className="sp-profile-header">
                <div className="sp-profile-avatar-wrap">
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="" className="sp-profile-avatar" />
                    : <div className="sp-profile-avatar-ph"><User size={40} /></div>
                  }
                </div>
                <div className="sp-profile-name">{user?.displayName || 'Pendengar'}</div>
                <div className="sp-profile-email">{user?.email}</div>
                <div className="sp-profile-badges">
                  <span className="sp-profile-badge">Free Plan</span>
                  <span className="sp-profile-badge sp-profile-badge-green">{likedList.length} Lagu Disukai</span>
                </div>
              </div>

              {/* Stats */}
              <div className="sp-profile-stats">
                <div className="sp-profile-stat">
                  <div className="sp-profile-stat-num">{likedList.length}</div>
                  <div className="sp-profile-stat-label">Disukai</div>
                </div>
                <div className="sp-profile-stat-divider" />
                <div className="sp-profile-stat">
                  <div className="sp-profile-stat-num">{songs.length}</div>
                  <div className="sp-profile-stat-label">Lagu</div>
                </div>
                <div className="sp-profile-stat-divider" />
                <div className="sp-profile-stat">
                  <div className="sp-profile-stat-num">1</div>
                  <div className="sp-profile-stat-label">Playlist</div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="sp-profile-menu">
                <div className="sp-profile-menu-title">Akun</div>
                {[
                  { icon: <Heart size={20} />, label: 'Lagu Disukai', action: () => setActiveNav('liked') },
                  { icon: <ListMusic size={20} />, label: 'Playlist Saya', action: () => setActiveNav('playlist') },
                  { icon: <Radio size={20} />, label: 'Riwayat Diputar', action: () => {} },
                ].map(({ icon, label, action }) => (
                  <button key={label} className="sp-profile-menu-item" onClick={action}>
                    <span className="sp-profile-menu-icon">{icon}</span>
                    <span className="sp-profile-menu-label">{label}</span>
                    <ChevronRight size={18} className="sp-profile-menu-arrow" />
                  </button>
                ))}
              </div>

              <div className="sp-profile-menu" style={{ marginTop: 12 }}>
                <div className="sp-profile-menu-title">Tentang</div>
                {[
                  { icon: <Music2 size={20} />, label: 'FakhriMusic v1.0', action: () => {} },
                ].map(({ icon, label, action }) => (
                  <button key={label} className="sp-profile-menu-item" onClick={action}>
                    <span className="sp-profile-menu-icon">{icon}</span>
                    <span className="sp-profile-menu-label">{label}</span>
                    <ChevronRight size={18} className="sp-profile-menu-arrow" />
                  </button>
                ))}
              </div>

              {/* Logout */}
              <button className="sp-profile-logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                Keluar dari Akun
              </button>
            </section>
          )}

          {/* ── HOME VIEW ── */}
          {activeNav === 'home' && (
            <>
              {/* Greeting */}
              <div className="sp-hero">
                <h1 className="sp-hero-title">
                  {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Pendengar'}!
                </h1>

                {/* Quick access grid */}
                <div className="sp-quick-grid">
                  {QUICK.map(q => (
                    <div className="sp-quick-card" key={q.label}
                      style={{ background: `linear-gradient(135deg, ${q.bg} 0%, ${q.color}33 100%)` }}>
                      <div className="sp-quick-card-color">{q.icon}</div>
                      <span className="sp-quick-card-label">{q.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Cards */}
              <section className="sp-section">
                <div className="sp-section-header">
                  <h2 className="sp-section-title">Rekomendasi Untukmu</h2>
                  <button className="sp-see-all">Lihat semua</button>
                </div>
                <div className="sp-card-grid">
                  {featured.map(song => (
                    <Card key={song.id} song={song}
                      isActive={currentSong?.id === song.id}
                      isPlaying={isPlaying && currentSong?.id === song.id}
                      onPlay={() => currentSong?.id === song.id ? togglePlay() : playSong(song, featured)} />
                  ))}
                </div>
              </section>

              {/* Trending */}
              <section className="sp-section">
                <div className="sp-section-header">
                  <h2 className="sp-section-title">Trending Sekarang</h2>
                  <button className="sp-see-all">Lihat semua</button>
                </div>
                <div className="sp-card-grid">
                  {trending.map(song => (
                    <Card key={song.id} song={song}
                      isActive={currentSong?.id === song.id}
                      isPlaying={isPlaying && currentSong?.id === song.id}
                      onPlay={() => currentSong?.id === song.id ? togglePlay() : playSong(song, trending)} />
                  ))}
                </div>
              </section>

              {/* All Songs */}
              <section className="sp-section">
                <div className="sp-section-header">
                  <h2 className="sp-section-title">Semua Lagu</h2>
                  <span style={{ color: '#b3b3b3', fontSize: '0.875rem' }}>{songs.length} lagu</span>
                </div>
                <SongHeader />
                {songs.map((song, i) => (
                  <SongRow key={song.id} song={song} index={i}
                    onPlay={() => currentSong?.id === song.id ? togglePlay() : playSong(song, songs)}
                    isActive={currentSong?.id === song.id}
                    isPlaying={isPlaying && currentSong?.id === song.id}
                    isLiked={isLiked(song.id)} onLike={() => toggleLike(song.id)} />
                ))}
              </section>
            </>
          )}
        </div>
      </main>

      {/* ─── NOW PLAYING SIDEBAR ─── */}
      {isNowPlayingOpen && currentSong && !isLyricsOpen && (
        <NowPlayingSidebar
          currentSong={currentSong}
          onClose={() => setIsNowPlayingOpen(false)}
          onExpandLyrics={openLyrics}
        />
      )}

      {/* ─── FULL SCREEN LYRICS ─── */}
      {isLyricsOpen && currentSong && (
        <FullPageLyrics currentSong={currentSong} onClose={closeLyrics} />
      )}

      {/* ─── PLAYER BAR ─── */}
      {currentSong && (
        <div className="sp-player">
          {/* Mobile only: progress + mini strip */}
          <div className="sp-mobile-progress-bar"
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
            <div className="sp-mobile-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sp-player-mini" onClick={() => setIsLyricsOpen(true)}>
            <img src={currentSong.cover} className="sp-player-cover" alt="" />
            <div className="sp-player-meta">
              <div className="sp-player-title">{currentSong.title}</div>
              <div className="sp-player-artist">{currentSong.artist}</div>
            </div>
            <button className="sp-ctrl-play sp-ctrl" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <button className="sp-ctrl" onClick={e => { e.stopPropagation(); handleNext(); }}><SkipForward size={20} /></button>
          </div>

          {/* Left: track info (desktop) */}
          <div className="sp-player-track" onClick={() => setIsNowPlayingOpen(!isNowPlayingOpen)}>
            <img src={currentSong.cover} alt={currentSong.title} className="sp-player-cover" />
            <div className="sp-player-meta">
              <div className="sp-player-title">{currentSong.title}</div>
              <div className="sp-player-artist">{currentSong.artist}</div>
            </div>
            <button
              className={`sp-player-heart ${isLiked(currentSong.id) ? 'liked' : ''}`}
              onClick={e => { e.stopPropagation(); toggleLike(currentSong.id); }}
            >
              <Heart size={16} fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Center: controls (desktop) */}
          <div className="sp-player-center">
            <div className="sp-player-btns">
              <button className={`sp-ctrl ${isShuffled ? 'active' : ''}`} onClick={toggleShuffle}>
                <Shuffle size={16} />
              </button>
              <button className="sp-ctrl" onClick={handlePrev}><SkipBack size={18} /></button>
              <button className="sp-ctrl sp-ctrl-play" onClick={togglePlay}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button className="sp-ctrl" onClick={handleNext}><SkipForward size={18} /></button>
              <button className={`sp-ctrl ${repeatMode !== 'none' ? 'active' : ''}`} onClick={toggleRepeat}>
                <Repeat size={16} />
                {repeatMode === 'one' && (
                  <span style={{ position: 'absolute', bottom: -4, right: -2, fontSize: '0.55rem', fontWeight: 900, color: 'var(--sp-green)' }}>1</span>
                )}
              </button>
            </div>

            <div className="sp-progress">
              <span className="sp-time">{fmt(currentTime)}</span>
              <div className="sp-progress-track"
                onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * duration); }}>
                <div className="sp-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="sp-time">{fmt(duration)}</span>
            </div>
          </div>

          {/* Right: volume + lyrics toggle (desktop) */}
          <div className="sp-player-right">
            <button
              className={`sp-lyrics-toggle ${isNowPlayingOpen ? 'active' : ''}`}
              onClick={() => setIsNowPlayingOpen(!isNowPlayingOpen)}
              title="Now Playing View"
            >
              <Mic2 size={16} />
            </button>
            <Volume2 size={16} className="sp-vol-icon" />
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="sp-volume-slider"
            />
          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="sp-mobile-bottom-nav">
        {[
          { key: 'home',    icon: <Home size={22} />,    label: 'Beranda' },
          { key: 'search',  icon: <Search size={22} />,  label: 'Cari' },
          { key: 'liked',   icon: <Heart size={22} />,   label: 'Disukai' },
          { key: 'profile', icon: <User size={22} />,    label: 'Profil' },
        ].map(({ key, icon, label }) => (
          <button key={key} className={`sp-mobile-nav-btn ${activeNav === key ? 'active' : ''}`}
            onClick={() => setActiveNav(key)}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppPage;
