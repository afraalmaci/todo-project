import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        const errorText = await response.text();
        alert('Registration failed: ' + errorText);
      }
    } catch (err) {
      console.error('Registration network error:', err);
      alert('Network error: Could not reach server. Is backend running?');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.registerForm} >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.registerInput} 
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className= {styles.registerInput}
        required
      />
      <button type="submit" className={styles.registerButton} >
        Register
      </button>
    </form>
  );
}