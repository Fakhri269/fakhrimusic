import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login logic, redirect to / (or /app later)
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container fade-in-up">
        
        <div className="login-header">
          <Link to="/" className="logo-link">
            <Music className="icon-primary" size={32} />
            <span className="logo-text">FakhriMusic</span>
          </Link>
          <h2>Welcome back</h2>
          <p>Sign in to continue your audio journey</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                id="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-large login-submit">
            Sign In <ArrowRight size={20} />
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#">Sign up for free</a></p>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>
    </div>
  );
};

export default LoginPage;
