import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const ACCENTS = {
  success: { border: 'border-l-sage-400', badge: 'bg-sage-100 text-sage-600' },
  error: { border: 'border-l-rose-400', badge: 'bg-rose-100 text-rose-500' },
  info: { border: 'border-l-lavender-400', badge: 'bg-lavender-100 text-lavender-500' },
};

const ICONS = {
  success: '✓',
  error: '!',
  info: 'i',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => {
          const accent = ACCENTS[t.type] || ACCENTS.info;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto animate-pop flex items-center gap-2.5 bg-white text-sm px-4 py-3 rounded-xl border-l-4 shadow-card ${accent.border}`}
            >
              <span
                aria-hidden="true"
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${accent.badge}`}
              >
                {ICONS[t.type] || ICONS.info}
              </span>
              <span className="text-ink font-medium">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return ctx;
}
