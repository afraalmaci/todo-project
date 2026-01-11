import React, { useState } from 'react';

export default function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        onRegisterSuccess();
      } else {
        // Try to get error message from backend
        const errorText = await response.text();
        alert('Registration failed: ' + errorText);
      }
    } catch (err) {
      console.error('Registration network error:', err);
      alert('Network error: Could not reach server. Is backend running?');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={{ display: 'block', marginBottom: '10px', padding: '5px', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ display: 'block', marginBottom: '10px', padding: '5px', width: '100%' }}
      />
      <button type="submit" style={{ padding: '8px 16px', width: '100%' }}>Register</button>
    </form>
  );
}