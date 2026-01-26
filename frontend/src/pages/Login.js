import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      alert('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/todos';
      } else {
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login network error:', error);
      alert('Could not connect to server. Is the backend running?');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>Login</h2>

      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.loginInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.loginInput}
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