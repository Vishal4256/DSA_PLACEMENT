import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = ({ setView, setResetToken }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setSuccessMsg('');
    setSimulatedLink('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Reset code simulated successfully!');
      if (result.token) {
        setResetToken(result.token);
      }
      if (result.resetUrl) {
        setSimulatedLink(result.resetUrl);
      }
    } else {
      setError(result.error || 'Email request failed');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="glass auth-card">
        <div className="auth-header">
          <h2>Recover Password</h2>
          <p className="subtitle">Enter your registered email to request a reset link.</p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}
        {successMsg && <div className="auth-success-alert">{successMsg}</div>}

        {!simulatedLink ? (
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

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Send Recovery Link'}
            </button>
          </form>
        ) : (
          <div className="simulated-recovery-block fade-in">
            <p className="sim-title">💡 Local Developer Simulation</p>
            <p className="sim-desc">Since this project runs locally, the password recovery link has been simulated for you below:</p>
            
            <button 
              className="sim-action-btn"
              onClick={() => setView('reset')}
            >
              Open Reset Password Form
            </button>
          </div>
        )}

        <div className="auth-footer">
          <button className="text-btn active-link" onClick={() => setView('login')}>
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
