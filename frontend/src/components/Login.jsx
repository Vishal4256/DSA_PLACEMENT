import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ setView }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (typeof setView === 'function') setView(null);
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue your DSA placement journey.</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button 
                type="button" 
                className="text-btn forgot-link" 
                onClick={() => setView('forgot')}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button className="text-btn active-link" onClick={() => setView('signup')}>Sign Up</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
