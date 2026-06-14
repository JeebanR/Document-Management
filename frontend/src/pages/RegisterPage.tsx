import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export function RegisterPage() {
  const [name, setName] = useState('');
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
      const result = await register(name, email, password);
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
        <div className="page-header__eyebrow">DocVault — Register</div>
        <h1>Request an entry</h1>
        <p className="auth-card__sub">
          New accounts are added to the registry as Staff. An administrator can raise your access level afterwards.
        </p>

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@docvault.io"
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
              placeholder="At least 8 characters, 1 number"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn--stamp" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div className="auth-card__footer">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
