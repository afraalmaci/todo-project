// frontend/src/Login.js
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // 🔹 TRIM spaces from input
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // 🔹 Basic validation
    if (!cleanUsername || !cleanPassword) {
      alert('Please enter both username and password.');
      return;
    }

    try {
      // 🔹 Use fetch (no axios!)
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Success: save token and go to todos
        onLogin(data.token);
      } else {
        // ❌ Show exact error from backend
        alert('Login failed: ' + (data.message || 'Invalid username or password'));
      }
    } catch (error) {
      // 🔹 Network error (backend not running, etc.)
      console.error('Login network error:', error);
      alert('Could not connect to server. Is the backend running?');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <button
        type="submit"
        style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
      >
        Login
      </button>
    </form>
  );
}