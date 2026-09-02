import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordChecklist from 'react-password-checklist';
import registerSchema from '../validation/registerSchema';
import { apiFetch } from '../utils/api';
import { useToast } from '../components/Toast';
import Logo from '../components/Logo';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ username: '', password: '' });

    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, password: 'Passwords do not match.' }));
      return;
    }

    setSubmitting(true);
    try {
      await registerSchema.validate({ username, password }, { abortEarly: false });

      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.ok) {
        showToast('Account created! Log in to continue.', 'success');
        navigate('/login');
      } else {
        const errorText = await response.text();
        showToast(errorText || 'Registration failed', 'error');
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const newErrors = { username: '', password: '' };
        err.inner.forEach((e) => {
          if (e.path === 'username') newErrors.username = e.message;
          if (e.path === 'password') newErrors.password = e.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Network or unexpected error:', err);
        showToast('Something went wrong. Please try again.', 'error');
      }
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
          Create an account
        </h1>
        <p className="text-center text-muted dark:text-night-muted text-sm mb-6">
          A few seconds and you're in
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-3 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
            />
            {errors.username && (
              <p className="mt-1 text-xs font-medium text-rose-500 dark:text-[#e0a3bd]">{errors.username}</p>
            )}
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-3 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-3 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
          />

          {(password || confirmPassword) && (
            <div className="bg-mist/70 dark:bg-night-bg/70 rounded-lg px-3 py-2">
              <PasswordChecklist
                rules={['minLength', 'letter', 'number', 'match']}
                minLength={6}
                value={password}
                valueAgain={confirmPassword}
                messages={{
                  minLength: 'At least 6 characters',
                  letter: 'Contains a letter',
                  number: 'Contains a number',
                  match: 'Passwords match',
                }}
                iconSize={12}
                className="!text-xs [&_span]:text-muted dark:[&_span]:text-night-muted"
                validColor="#5a9c85"
                invalidColor="#a85e75"
              />
            </div>
          )}

          {errors.password && (
            <p className="text-xs font-medium text-rose-500 dark:text-[#e0a3bd] text-center">{errors.password}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 text-sm font-semibold text-white bg-sage-400 rounded-xl py-3 hover:bg-sage-500 transition disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
