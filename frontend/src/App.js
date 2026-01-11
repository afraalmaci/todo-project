// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';

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

// ✅ Keep your original todo logic, but accept `token` and `onLogout`
function TodoList({ token, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  const apiCall = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };
    const res = await fetch(url, config);
    if (res.status === 401) {
      // Token expired or invalid
      alert('Session expired. Please log in again.');
      onLogout();
      return null;
    }
    return res.json();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const data = await apiCall('http://localhost:8080/api/todos');
    if (data) setTodos(data);
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    const newTodo = { title, description, completed };
    await apiCall('http://localhost:8080/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodo),
    });
    setTitle('');
    setDescription('');
    setCompleted(false);
    fetchTodos();
  };

  const toggleComplete = async (id, currentStatus) => {
    const updated = { ...todos.find(t => t.id === id), completed: !currentStatus };
    await apiCall(`http://localhost:8080/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await apiCall(`http://localhost:8080/api/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Todos</h2>
        <button onClick={onLogout} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none' }}>
          Logout
        </button>
      </div>

      {/* Add Todo Form */}
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '150px' }}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '150px' }}
        />
        <button onClick={addTodo} style={{ padding: '5px 10px' }}>
          Add Todo
        </button>
      </div>

      {/* Todo List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <strong>{todo.title}</strong> – {todo.description}
            <div>
              <span style={{ color: todo.completed ? 'green' : 'red' }}>
                {todo.completed ? '✅ Done' : '⏳ Pending'}
              </span>
              <button
                onClick={() => toggleComplete(todo.id, todo.completed)}
                style={{ marginLeft: '10px', marginRight: '5px' }}
              >
                {todo.completed ? 'Undo' : 'Complete'}
              </button>
              <button onClick={() => deleteTodo(todo.id)} style={{ color: 'red' }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;