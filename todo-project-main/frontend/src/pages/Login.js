import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';
import { apiFetch, setToken } from '../utils/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        navigate('/todos');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Could not connect to server. Is the backend running?');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>Login</h2>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.loginInput}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.loginInput}
          required
        />

        <button type="submit" className={styles.loginBtn}>
          Login
        </button>
      </form>

      <div className={styles.registerPrompt}>
        <span className={styles.registerText}>Don't have an account?</span>
        <Link to="/register" className={styles.registerLink}>
          <button type="button" className={styles.registerBtn}>
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
