import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      setSession(result);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__mark">DV</div>
        <div className="page-header__eyebrow">DocVault — Sign In</div>
        <h1>Open the registry</h1>
        <p className="auth-card__sub">Sign in to access documents assigned to your role.</p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn--stamp" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-card__footer">
          New here? <Link to="/register">Create an account</Link>
        </div>

        <div className="auth-card__demo">
          <div className="auth-card__demo-title">Demo accounts (password: Password123)</div>
          <code>admin@docvault.io</code> · <code>manager@docvault.io</code> · <code>employee@docvault.io</code>
        </div>
      </div>
    </div>
  );
}
