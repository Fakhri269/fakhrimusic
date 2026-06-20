import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const albumSeeds = [
  'la1','la2','la3','la4',
  'la5','la6','la7','la8',
  'la9','la10','la11','la12',
  'la13','la14','la15','la16',
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setError('Email/password login is not implemented yet. Please use Google Sign In.');
  };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-left-bg">
          <div className="login-left-gradient" />
        </div>

        <div className="login-left-content">
          {/* Album grid */}
          <div className="login-album-grid">
            {albumSeeds.map((s, i) => (
              <div className="login-album-cell" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <img src={`https://picsum.photos/seed/${s}/200/200`} alt="" loading="lazy" />
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="login-left-quote anim-fade-up delay-200">
            <blockquote>
              "Music gives a soul to the universe, wings to the mind, flight to the{' '}
              <span className="quote-accent">imagination</span>, and life to everything."
            </blockquote>
            <cite>— Plato</cite>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div className="login-right">
        <div className="login-form-container anim-fade-up">

          <Link to="/" className="login-back">
            <ArrowLeft size={16} /> Back to home
          </Link>

          <div className="login-logo">
            <Music2 size={28} />
            FakhriMusic
          </div>

          <h1 className="login-heading">Log in to FakhriMusic</h1>
          <p className="login-subheading">
            Don't have an account?{' '}
            <a href="#" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>
              Sign up free
            </a>
          </p>

          {/* Google Login */}
          <button
            className="social-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="login-divider">OR</div>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <div className="field-wrap">
                <Mail className="field-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
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
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="field-forgot">
                <a href="#">Forgot your password?</a>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Log In <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />

          <div className="login-signup">
            Don't have an account?{' '}
            <a href="#">Sign up for free</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
