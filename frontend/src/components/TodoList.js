import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import styles from '../styles/TodoList.module.css';

export default function TodoList() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState('');

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const handleLogout = useCallback(() => {
    fetch('http://localhost:8080/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch((err) => {
        console.error('Logout error:', err);
        navigate('/login', { replace: true });
      });
  }, [navigate]);
  
  const apiCall = useCallback(async (url, options = {}) => {
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    
    const res = await fetch(url, config);

    if (res.status === 401) {
      handleLogout();
      return null;
    }

    if (res.status === 204) return null;
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  }, [handleLogout]);

  const fetchTodos = useCallback(async () => {
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
  }, [apiCall]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);
  
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

  const openDeleteModal = (id) => {
    setTodoToDelete(id);
    setDeleteModalOpen(true);
  };

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Todos</h2>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <form onSubmit={addTodo} className={styles.addForm}>
        <h3>Add New Todo</h3>
        <input
          type="text"
          placeholder="Title *"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          className={styles.input}
        />
        <textarea
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows="2"
          className={styles.input}
        />
        <input
          type="datetime-local"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Tags (comma separated, e.g. work,urgent)"
          value={newTags}
          onChange={(e) => setNewTags(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.addButton}>
          Add Todo
        </button>
      </form>

      {loading && <p className={styles.message}>Loading todos...</p>}
      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      {todos.length === 0 && !loading && <p className={styles.message}>No todos yet. Add one above!</p>}

      <ul className={styles.todoList}>
        {todos.map(todo => (
          <li key={todo.id} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id, todo.completed)}
              className={styles.checkbox}
            />
            <div className={styles.todoContent}>
              <h4 className={todo.completed ? styles.completedText : ''}>{todo.title}</h4>
              {todo.description && <p>{todo.description}</p>}
              {todo.dueDate && (
                <p className={styles.dueDate}>📅 Due: {formatDate(todo.dueDate)}</p>
              )}
              {todo.tags && todo.tags.length > 0 && (
                <div className={styles.tags}>
                  {todo.tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => openDeleteModal(todo.id)} className={styles.deleteButton}>
              Delete
            </button>
          </li>
        ))}
      </ul>

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