import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, setToken, setUsername as saveUsername } from '../utils/api';
import Logo from '../components/Logo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        saveUsername(data.username);
        navigate('/todos');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist dark:bg-night-bg flex items-center justify-center px-4 py-16 transition-colors">
      <div className="w-full max-w-[340px] bg-white dark:bg-night-card rounded-2xl shadow-card px-7 py-8">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <h1 className="text-xl font-bold text-ink dark:text-night-text text-center mb-1">
          Welcome back
        </h1>
        <p className="text-center text-muted dark:text-night-muted text-sm mb-6">
          Log in to see your list
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-[#3a2530] text-rose-500 dark:text-[#e0a3bd] text-sm font-medium px-3 py-2 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-3 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-3 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 text-sm font-semibold text-white bg-sage-400 rounded-xl py-3 hover:bg-sage-500 transition disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-muted dark:text-night-muted mt-5 text-center">
          New here?{' '}
          <Link to="/register" className="text-sage-600 dark:text-sage-300 font-semibold hover:text-sage-700 dark:hover:text-sage-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
