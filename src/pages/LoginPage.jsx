import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Mail, Lock, ArrowRight, ArrowLeft, User } from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

import { songs } from '../data/songs';

const albumCovers = songs.slice(0, 16).map(s => s.cover);
// Jika kurang dari 16, ulangi array
while (albumCovers.length < 16) {
  albumCovers.push(...albumCovers.slice(0, 16 - albumCovers.length));
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

// Map Firebase error codes to user-friendly messages
const getFirebaseError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan login.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/weak-password':
      return 'Password terlalu lemah. Minimal 6 karakter.';
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan. Cek email kamu.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau password salah.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi nanti.';
    case 'auth/network-request-failed':
      return 'Gagal konek ke server. Cek koneksi internet kamu.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di Firebase Console.';
    default:
      return 'Terjadi kesalahan. Coba lagi.';
  }
};

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // ── Google Sign In ──
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      navigate('/app');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFirebaseError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email / Password Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err) {
      console.error(err);
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Email / Password Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      navigate('/app');
    } catch (err) {
      console.error(err);
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-left-bg">
          <div className="login-left-gradient" />
        </div>
        <div className="login-left-content">
          <div className="login-album-grid">
            {albumCovers.map((coverUrl, i) => (
              <div className="login-album-cell" key={i}>
                <img 
                  src={coverUrl} 
                  alt="" 
                  loading="lazy" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${i}&backgroundColor=1ed760`; }}
                />
              </div>
            ))}
          </div>
          <div className="login-left-quote anim-fade-up delay-200">
            <blockquote>
              "Music gives a soul to the universe, wings to the mind, flight to the{' '}
              <span className="quote-accent">imagination</span>, and life to everything."
            </blockquote>
            <cite>— Plato</cite>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-container anim-fade-up">

          <Link to="/" className="login-back">
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>

          <div className="login-logo">
            <Music2 size={28} />
            FakhriMusic
          </div>

          {/* Tab toggle */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Masuk
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Daftar
            </button>
          </div>

          <h1 className="login-heading">
            {isLogin ? 'Selamat datang kembali' : 'Buat akun gratis'}
          </h1>
          <p className="login-subheading">
            {isLogin
              ? 'Masuk untuk melanjutkan perjalanan musikmu.'
              : 'Bergabung dan nikmati jutaan lagu favorit.'}
          </p>

          {/* Google */}
          <button className="social-btn" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon />
            {loading ? 'Menunggu...' : isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}
          </button>

          <div className="login-divider">ATAU</div>

          {error && <div className="login-error">{error}</div>}

          {/* FORM */}
          <form onSubmit={isLogin ? handleLogin : handleRegister}>

            {/* Name — only on register */}
            {!isLogin && (
              <div className="field-group">
                <label className="field-label" htmlFor="name">Nama lengkap</label>
                <div className="field-wrap">
                  <User className="field-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    className="field-input"
                    placeholder="Nama kamu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <div className="field-wrap">
                <Mail className="field-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrap">
                <Lock className="field-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  className="field-input"
                  placeholder={isLogin ? 'Password kamu' : 'Min. 6 karakter'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
              {isLogin && (
                <div className="field-forgot">
                  <a href="#">Lupa password?</a>
                </div>
              )}
            </div>

            {/* Confirm password — only on register */}
            {!isLogin && (
              <div className="field-group">
                <label className="field-label" htmlFor="confirmPassword">Konfirmasi password</label>
                <div className="field-wrap">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="field-input"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? 'Memproses...'
                : isLogin
                  ? <>Masuk <ArrowRight size={18} /></>
                  : <>Buat Akun <ArrowRight size={18} /></>
              }
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }} />

          <div className="login-signup">
            {isLogin ? (
              <>Belum punya akun?{' '}
                <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer', fontSize: 'inherit' }}>
                  Daftar gratis
                </button>
              </>
            ) : (
              <>Sudah punya akun?{' '}
                <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer', fontSize: 'inherit' }}>
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
