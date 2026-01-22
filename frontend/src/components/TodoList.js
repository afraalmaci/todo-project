import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

export default function TodoList({ token, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for new todo
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState('');

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  // Fetch todos on load
  useEffect(() => {
    fetchTodos();
  }, []);

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
    alert('Session expired. Please log in again.');
    onLogout();
    return null;
  }

  // Handle 204 No Content (common for PUT/DELETE)
  if (res.status === 204) {
    return null; // no body to parse
  }

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await apiCall('http://localhost:8080/api/todos');
      setTodos(data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch todos error:', err);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagList = newTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(name => ({ name }));

    const newTodo = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      completed: false,
      dueDate: newDueDate || null,
      tags: tagList,
    };

    try {
      await apiCall('http://localhost:8080/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewTags('');
      fetchTodos();
    } catch (err) {
      alert('Failed to add todo: ' + err.message);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    // Optimistically update UI
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !currentStatus } : todo
      )
    );

    const updatedTodo = todos.find(t => t.id === id);
    if (!updatedTodo) return;

    const revertedTodo = { ...updatedTodo, completed: currentStatus };

    try {
      await apiCall(`http://localhost:8080/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updatedTodo, completed: !currentStatus }),
      });
    } catch (err) {
      console.error('Update failed, reverting:', err);
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? revertedTodo : todo
        )
      );
    }
  };

  // Open modal when user clicks "Delete"
  const openDeleteModal = (id) => {
    setTodoToDelete(id);
    setDeleteModalOpen(true);
  };

  // Confirm deletion from modal
  const confirmDelete = async () => {
    if (!todoToDelete) return;

    const id = todoToDelete;

    setTodos(prev => prev.filter(todo => todo.id !== id));

    try {
      await apiCall(`http://localhost:8080/api/todos/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete failed, restoring todo:', err);
      fetchTodos();
    } finally {
      setDeleteModalOpen(false);
      setTodoToDelete(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Todos</h2>
        <button
          onClick={onLogout}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Add New Todo</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Title *"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <textarea
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows="2"
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated, e.g. work,urgent)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add Todo
        </button>
      </form>

      {/* Loading / Error */}
      {loading && <p>Loading todos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {todos.length === 0 && !loading && <p>No todos yet. Add one above!</p>}

      {/* Todo List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              padding: '15px',
              marginBottom: '10px',
              border: '1px solid #eee',
              borderRadius: '8px',
              backgroundColor: todo.completed ? '#f9f9f9' : 'white',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id, todo.completed)}
              style={{
                marginTop: '4px',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />

            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 5px 0',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#333'
              }}>
                {todo.title}
              </h4>
              {todo.description && (
                <p style={{ margin: '0 0 5px 0', color: '#555' }}>{todo.description}</p>
              )}
              {todo.dueDate && (
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#666' }}>
                  📅 Due: {formatDate(todo.dueDate)}
                </p>
              )}
              {todo.tags && todo.tags.length > 0 && (
                <div>
                  {todo.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#e0e0e0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        marginRight: '5px',
                        marginTop: '5px'
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => openDeleteModal(todo.id)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              Delete
            </button>
          </li>
))}
      </ul>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this todo?"
        />
      )}
    </div>
  );
}