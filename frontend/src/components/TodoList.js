import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Logo from './Logo';
import { apiFetch, clearToken, getUsername } from '../utils/api';
import { useToast } from './Toast';
import {
  tagChipClasses,
  dueDateStatus,
  DUE_DATE_BADGE_CLASSES,
  DUE_DATE_BADGE_LABEL,
} from '../utils/todoStyle';

export default function TodoList() {
  const navigate = useNavigate();
  const showToast = useToast();
  const username = getUsername();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const handleLogout = useCallback(() => {
    // JWT auth is stateless - there's nothing to invalidate server-side, just
    // drop the token and send the user back to the login screen.
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  const apiCall = useCallback(async (path, options = {}) => {
    const res = await apiFetch(path, options);

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
      const data = await apiCall('/api/todos');
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

    setAddingTodo(true);
    try {
      await apiCall('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setNewTags('');
      setFormOpen(false);
      fetchTodos();
      showToast('Todo added!', 'success');
    } catch (err) {
      showToast('Failed to add todo: ' + err.message, 'error');
    } finally {
      setAddingTodo(false);
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
      await apiCall(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updatedTodo, completed: !currentStatus }),
      });
    } catch (err) {
      console.error('Update failed, reverting:', err);
      showToast('Could not update that todo', 'error');
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
      await apiCall(`/api/todos/${id}`, { method: 'DELETE' });
      showToast('Todo deleted', 'info');
    } catch (err) {
      console.error('Delete failed, restoring todo:', err);
      showToast('Could not delete that todo', 'error');
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

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-white/80 backdrop-blur border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            {username && (
              <span className="hidden sm:block text-sm text-muted">
                {username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-ink bg-white shadow-card rounded-full px-4 py-1.5 hover:bg-mist transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {totalCount > 0 && (
          <div className="mb-5 bg-white rounded-2xl shadow-card px-5 py-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-semibold text-ink">Today's progress</span>
              <span className="text-muted">{completedCount} / {totalCount}</span>
            </div>
            <div className="h-2 rounded-full bg-mist overflow-hidden">
              <div
                className="h-full rounded-full bg-sage-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full mb-5 bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-2 text-faint text-sm hover:text-muted transition"
          >
            <span className="text-lg leading-none">+</span>
            <span>New to-do</span>
          </button>
        )}

        {formOpen && (
          <form onSubmit={addTodo} className="mb-5 bg-white rounded-2xl shadow-card px-5 py-5">
            <div className="flex flex-col gap-2.5">
              <input
                type="text"
                placeholder="What needs doing? *"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                autoFocus
                className="w-full bg-mist rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
              />
              <textarea
                placeholder="Any details? (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows="2"
                className="w-full bg-mist rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition resize-none"
              />
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-mist rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                />
                <input
                  type="text"
                  placeholder="Tags: work, urgent"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-mist rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                />
              </div>
              <div className="flex gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-sm font-semibold text-muted bg-mist rounded-xl px-4 py-2.5 hover:bg-ghost/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingTodo}
                  className="flex-1 text-sm font-semibold text-white bg-sage-400 rounded-xl py-2.5 hover:bg-sage-500 transition disabled:opacity-60 disabled:pointer-events-none"
                >
                  {addingTodo ? 'Adding…' : 'Add todo'}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-sm font-medium text-rose-500 bg-rose-50 rounded-xl py-3 mb-4">
            {error}
          </p>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-3 animate-floaty">🗒️</div>
            <p className="font-bold text-ink text-lg">Nothing here yet</p>
            <p className="text-muted text-sm">Add your first todo above to get started!</p>
          </div>
        )}

        {todos.length > 0 && (
          <>
            <p className="text-xs font-bold text-faint uppercase tracking-wide mb-2 px-1">My list</p>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {todos.map(todo => {
                const status = dueDateStatus(todo.dueDate);
                return (
                  <div
                    key={todo.id}
                    className="group flex items-start gap-3 px-5 py-4 border-b border-black/5 last:border-b-0"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={todo.completed}
                      onClick={() => toggleComplete(todo.id, todo.completed)}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        todo.completed
                          ? 'bg-sage-400 border-sage-400'
                          : 'bg-white border-ghost hover:border-sage-400'
                      }`}
                    >
                      {todo.completed && <span className="text-white text-[10px]">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-medium text-ink break-words ${todo.completed ? 'line-through text-faint' : ''}`}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className={`text-sm text-muted mt-0.5 break-words ${todo.completed ? 'line-through text-ghost' : ''}`}>
                          {todo.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {status && (
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${todo.completed ? 'bg-mist text-ghost' : DUE_DATE_BADGE_CLASSES[status]}`}>
                            {DUE_DATE_BADGE_LABEL[status]} {formatDate(todo.dueDate)}
                          </span>
                        )}
                        {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${todo.completed ? 'bg-mist text-ghost' : tagChipClasses(tag.name)}`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => openDeleteModal(todo.id)}
                      aria-label="Delete todo"
                      className="shrink-0 text-faint opacity-0 group-hover:opacity-100 hover:text-rose-500 transition text-sm mt-0.5"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {deleteModalOpen && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete this todo?"
          message="This can't be undone."
        />
      )}
    </div>
  );
}
