import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ResetPassword = ({ setView, resetToken }) => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);

    const result = await resetPassword(resetToken, password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        setView('login');
      }, 2000);
    } else {
      setError(result.error || 'Password reset failed');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your new secure password below.</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}
        {successMsg && <div className="auth-success-alert">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <button className="text-btn active-link" onClick={() => setView('login')}>
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
