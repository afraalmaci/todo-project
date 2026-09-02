import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/25 px-4"
      onClick={onClose}
    >
      <div
        className="animate-pop w-full max-w-sm bg-white dark:bg-night-card rounded-2xl shadow-card px-6 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="text-lg font-bold text-ink dark:text-night-text text-center mb-2">
            {title}
          </h3>
        )}
        {message && (
          <p className="text-center text-muted dark:text-night-muted text-sm mb-6">{message}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold text-ink dark:text-night-text bg-mist dark:bg-night-bg hover:bg-ghost/40 dark:hover:bg-night-ghost/40 rounded-xl py-2.5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-sm font-semibold text-white bg-rose-400 hover:bg-rose-500 rounded-xl py-2.5 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
