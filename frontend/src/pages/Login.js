import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      const formData = new URLSearchParams();
      formData.append('username', cleanUsername);
      formData.append('password', cleanPassword);
      if (rememberMe) {
        formData.append('remember-me', 'true');
      }

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigate('/todos');
      } else {
        setError(data.message || 'Invalid credentials');
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
        
        <div className={styles.rememberMeContainer}>
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.rememberMeCheckbox}
          />
          <label htmlFor="remember-me" className={styles.rememberMeLabel}>
            Remember Me
          </label>
        </div>

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