import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import ConfirmModal from './ConfirmModal';
import Sidebar from './Sidebar';
import TodoRow from './TodoRow';
import { apiFetch, clearToken, getUsername } from '../utils/api';
import { useToast } from './Toast';

export default function TodoList({ isDark, onToggleDark }) {
  const navigate = useNavigate();
  const showToast = useToast();
  const username = getUsername();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add-todo form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newListName, setNewListName] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  // Lists sidebar + search/filter state
  const [activeList, setActiveList] = useState('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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

  const openAddForm = () => {
    // Default the new todo's list to whatever list is currently open, so
    // adding from inside "Work" doesn't silently drop it into "Personal".
    setNewListName(activeList !== 'All' ? activeList : '');
    setFormOpen(true);
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
      listName: newListName.trim() || undefined,
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
      setNewListName('');
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

  // --- Lists sidebar data: derived from whatever todos are loaded, so a
  // list simply exists as soon as a todo uses it (same idea as tags). ---
  const lists = useMemo(() => {
    const counts = new Map();
    todos.forEach(t => {
      const name = t.listName || 'Personal';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const sortedNames = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
    return [
      { name: 'All', count: todos.length },
      ...sortedNames.map(name => ({ name, count: counts.get(name) })),
    ];
  }, [todos]);

  // --- Search + status filtering ---
  const searchTerm = search.trim().toLowerCase();
  const isFiltering = Boolean(searchTerm) || statusFilter !== 'all';

  const matchesFilters = useCallback((todo) => {
    if (statusFilter === 'active' && todo.completed) return false;
    if (statusFilter === 'completed' && !todo.completed) return false;
    if (searchTerm) {
      const haystack = `${todo.title || ''} ${todo.description || ''}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }
    return true;
  }, [statusFilter, searchTerm]);

  const listScopedTodos = useMemo(() => {
    if (activeList === 'All') return todos;
    return todos.filter(t => (t.listName || 'Personal') === activeList);
  }, [todos, activeList]);

  const visibleTodos = useMemo(
    () => listScopedTodos.filter(matchesFilters),
    [listScopedTodos, matchesFilters]
  );

  // Grouped by list when viewing "All", otherwise a single flat group.
  const groups = useMemo(() => {
    if (activeList !== 'All') {
      return visibleTodos.length > 0 ? [{ name: activeList, todos: visibleTodos }] : [];
    }
    const byList = new Map();
    visibleTodos.forEach(t => {
      const name = t.listName || 'Personal';
      if (!byList.has(name)) byList.set(name, []);
      byList.get(name).push(t);
    });
    return Array.from(byList.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, groupTodos]) => ({ name, todos: groupTodos }));
  }, [activeList, visibleTodos]);

  // Progress reflects the active list scope (ignoring search/status), so it
  // stays a stable "how am I doing on this list" summary.
  const completedCount = listScopedTodos.filter(t => t.completed).length;
  const totalCount = listScopedTodos.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const persistOrder = async (orderedIds) => {
    try {
      await apiCall('/api/todos/reorder', {
        method: 'PUT',
        body: JSON.stringify({ ids: orderedIds }),
      });
    } catch (err) {
      console.error('Reorder failed:', err);
      showToast('Could not save the new order', 'error');
      fetchTodos();
    }
  };

  // Reordering is scoped per group (per list): dragging inside "Work" only
  // reshuffles "Work" items, wherever they happen to sit in the full array.
  const handleDragEnd = (groupTodoIds) => (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groupTodoIds.indexOf(active.id);
    const newIndex = groupTodoIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newGroupOrder = arrayMove(groupTodoIds, oldIndex, newIndex);

    setTodos(prev => {
      const byId = new Map(prev.map(t => [t.id, t]));
      const groupIdSet = new Set(groupTodoIds);
      const slots = [];
      prev.forEach((t, i) => { if (groupIdSet.has(t.id)) slots.push(i); });

      const next = [...prev];
      newGroupOrder.forEach((id, i) => {
        next[slots[i]] = byId.get(id);
      });
      return next;
    });

    persistOrder(newGroupOrder);
  };

  return (
    <div className="min-h-screen bg-mist dark:bg-night-bg flex flex-col md:flex-row transition-colors">
      <Sidebar
        lists={lists}
        activeList={activeList}
        onSelectList={setActiveList}
        onNewList={openAddForm}
        isDark={isDark}
        onToggleDark={onToggleDark}
      />

      <div className="flex-1 min-w-0">
        <header className="bg-white/80 dark:bg-night-card/80 backdrop-blur border-b border-black/5 dark:border-night-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint dark:text-night-faint text-sm" aria-hidden="true">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search todos..."
                className="w-full bg-mist dark:bg-night-bg border border-black/5 dark:border-night-border rounded-xl pl-9 pr-3 py-2 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {['all', 'active', 'completed'].map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full capitalize transition ${
                    statusFilter === key
                      ? 'bg-sage-400 text-white'
                      : 'bg-white dark:bg-night-bg text-muted dark:text-night-muted border border-black/5 dark:border-night-border'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {username && (
                <span className="hidden sm:block text-sm text-muted dark:text-night-muted">
                  {username}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-ink dark:text-night-text bg-white dark:bg-night-card shadow-card rounded-full px-4 py-1.5 hover:bg-mist dark:hover:bg-night-bg transition"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {totalCount > 0 && (
            <div className="mb-5 bg-white dark:bg-night-card rounded-2xl shadow-card px-5 py-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-semibold text-ink dark:text-night-text">
                  {activeList === 'All' ? "Today's progress" : `${activeList} progress`}
                </span>
                <span className="text-muted dark:text-night-muted">{completedCount} / {totalCount}</span>
              </div>
              <div className="h-2 rounded-full bg-mist dark:bg-night-bg overflow-hidden">
                <div
                  className="h-full rounded-full bg-sage-400 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {!formOpen && (
            <button
              onClick={openAddForm}
              className="w-full mb-5 bg-white dark:bg-night-card rounded-2xl shadow-card px-5 py-4 flex items-center gap-2 text-faint dark:text-night-faint text-sm hover:text-muted dark:hover:text-night-muted transition"
            >
              <span className="text-lg leading-none">+</span>
              <span>New to-do</span>
            </button>
          )}

          {formOpen && (
            <form onSubmit={addTodo} className="mb-5 bg-white dark:bg-night-card rounded-2xl shadow-card px-5 py-5">
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  placeholder="What needs doing? *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-2.5 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                />
                <textarea
                  placeholder="Any details? (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="2"
                  className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-2.5 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-2.5 text-sm text-ink dark:text-night-text focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                  <input
                    type="text"
                    placeholder="Tags: work, urgent"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-2.5 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                  />
                </div>
                <input
                  type="text"
                  list="lists-datalist"
                  placeholder="List (default: Personal)"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full bg-mist dark:bg-night-bg rounded-xl px-3.5 py-2.5 text-sm text-ink dark:text-night-text placeholder:text-faint dark:placeholder:text-night-faint focus:outline-none focus:ring-2 focus:ring-sage-300 transition"
                />
                <datalist id="lists-datalist">
                  {lists.filter(l => l.name !== 'All').map(l => (
                    <option key={l.name} value={l.name} />
                  ))}
                </datalist>

                <div className="flex gap-2.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="text-sm font-semibold text-muted dark:text-night-muted bg-mist dark:bg-night-bg rounded-xl px-4 py-2.5 hover:bg-ghost/40 dark:hover:bg-night-ghost/40 transition"
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
                <div key={i} className="h-16 rounded-2xl bg-white/60 dark:bg-night-card/60 animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-center text-sm font-medium text-rose-500 dark:text-[#e0a3bd] bg-rose-50 dark:bg-[#3a2530] rounded-xl py-3 mb-4">
              {error}
            </p>
          )}

          {!loading && !error && totalCount === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-3 animate-floaty">🗒️</div>
              <p className="font-bold text-ink dark:text-night-text text-lg">Nothing here yet</p>
              <p className="text-muted dark:text-night-muted text-sm">Add your first todo above to get started!</p>
            </div>
          )}

          {!loading && !error && totalCount > 0 && groups.length === 0 && (
            <div className="text-center py-12">
              <p className="font-bold text-ink dark:text-night-text text-lg">No matches</p>
              <p className="text-muted dark:text-night-muted text-sm">Try a different search or filter.</p>
            </div>
          )}

          {groups.map(group => {
            const groupIds = group.todos.map(t => t.id);
            return (
              <div key={group.name} className="mb-6">
                <p className="text-xs font-bold text-faint dark:text-night-faint uppercase tracking-wide mb-2 px-1">
                  {group.name}
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd(groupIds)}
                >
                  <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
                    <div className="bg-white dark:bg-night-card rounded-2xl shadow-card overflow-hidden">
                      {group.todos.map(todo => (
                        <TodoRow
                          key={todo.id}
                          todo={todo}
                          onToggle={toggleComplete}
                          onDelete={openDeleteModal}
                          dragDisabled={isFiltering}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </main>
      </div>

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
