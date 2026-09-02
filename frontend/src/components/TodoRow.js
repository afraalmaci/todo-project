import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  tagChipClasses,
  dueDateStatus,
  DUE_DATE_BADGE_CLASSES,
  DUE_DATE_BADGE_LABEL,
} from '../utils/todoStyle';

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// A tag from the API can be a plain string ("work") or, right after this
// todo was just created client-side, an object like { name: "work" } -
// handle both so a badge never silently renders blank.
function tagLabel(tag) {
  return typeof tag === 'string' ? tag : tag?.name;
}

export default function TodoRow({ todo, onToggle, onDelete, dragDisabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const status = dueDateStatus(todo.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2.5 px-4 sm:px-5 py-4 border-b border-black/5 dark:border-night-border last:border-b-0 bg-white dark:bg-night-card"
    >
      {!dragDisabled && (
        <button
          type="button"
          aria-label="Drag to reorder"
          className="mt-0.5 shrink-0 text-faint dark:text-night-faint hover:text-muted dark:hover:text-night-muted cursor-grab active:cursor-grabbing touch-none select-none"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}

      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        onClick={() => onToggle(todo.id, todo.completed)}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          todo.completed
            ? 'bg-sage-400 border-sage-400'
            : 'bg-white dark:bg-night-card border-ghost dark:border-night-ghost hover:border-sage-400'
        }`}
      >
        {todo.completed && <span className="text-white text-[10px]">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium text-ink dark:text-night-text break-words ${todo.completed ? 'line-through text-faint dark:text-night-faint' : ''}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className={`text-sm text-muted dark:text-night-muted mt-0.5 break-words ${todo.completed ? 'line-through text-ghost dark:text-night-ghost' : ''}`}>
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {status && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${todo.completed ? 'bg-mist dark:bg-night-bg text-ghost dark:text-night-ghost' : DUE_DATE_BADGE_CLASSES[status]}`}>
              {DUE_DATE_BADGE_LABEL[status]} {formatDate(todo.dueDate)}
            </span>
          )}
          {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, i) => (
            <span
              key={i}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${todo.completed ? 'bg-mist dark:bg-night-bg text-ghost dark:text-night-ghost' : tagChipClasses(tagLabel(tag))}`}
            >
              {tagLabel(tag)}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Delete todo"
        className="shrink-0 text-faint dark:text-night-faint opacity-0 group-hover:opacity-100 hover:text-rose-500 transition text-sm mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
