// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import TodoList from '../src/components/TodoList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('login'); // 'login', 'register', or 'todos'

  // Check if token exists on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      setView('todos');
    }
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    setView('todos');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsLoggedIn(false);
    setView('login');
  };

  // Only show todos if logged in
  if (view === 'todos' && isLoggedIn) {
    return <TodoList token={token} onLogout={handleLogout} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Todo App</h1>

      {view === 'login' && (
        <>
          <Login onLogin={handleLogin} />
          <p>
            Don't have an account?{' '}
            <button onClick={() => setView('register')} style={{ marginLeft: '5px' }}>
              Register
            </button>
          </p>
        </>
      )}

      {view === 'register' && (
        <>
          <Register onRegisterSuccess={() => setView('login')} />
          <p>
            Already have an account?{' '}
            <button onClick={() => setView('login')} style={{ marginLeft: '5px' }}>
              Login
            </button>
          </p>
        </>
      )}
    </div>
  );
}


export default App;