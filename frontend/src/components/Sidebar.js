import React from 'react';
import Logo from './Logo';
import { listDotClasses } from '../utils/todoStyle';

export default function Sidebar({ lists, activeList, onSelectList, onNewList, isDark, onToggleDark }) {
  return (
    <aside className="w-full md:w-56 shrink-0 bg-[#eef1ee] dark:bg-night-sidebar border-b md:border-b-0 md:border-r border-black/5 dark:border-night-border px-4 py-4 md:py-5 flex flex-col gap-5 md:gap-6 md:min-h-screen">
      <div className="px-1">
        <Logo />
      </div>

      <div>
        <p className="hidden md:block text-[11px] font-bold text-faint dark:text-night-faint uppercase tracking-wide px-2 pb-1.5">
          Lists
        </p>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
          {lists.map((list) => (
            <button
              key={list.name}
              type="button"
              onClick={() => onSelectList(list.name)}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                activeList === list.name
                  ? 'bg-white dark:bg-night-card text-ink dark:text-night-text font-bold shadow-card'
                  : 'text-muted dark:text-night-muted font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  list.name === 'All' ? 'bg-sage-400' : listDotClasses(list.name)
                }`}
                aria-hidden="true"
              />
              {list.name === 'All' ? 'All todos' : list.name}
              <span className="ml-auto md:ml-2 text-xs font-semibold text-faint dark:text-night-faint">
                {list.count}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onNewList}
          className="mt-1 px-3 py-1.5 text-[13px] font-semibold text-faint dark:text-night-faint hover:text-sage-600 dark:hover:text-sage-300 transition"
        >
          + New list
        </button>
      </div>

      <div className="md:mt-auto">
        <button
          type="button"
          onClick={onToggleDark}
          className="w-full flex items-center gap-2 border border-black/5 dark:border-night-border bg-white dark:bg-night-card text-muted dark:text-night-muted text-sm font-semibold px-3 py-2.5 rounded-xl shadow-card transition"
        >
          {isDark ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </div>
    </aside>
  );
}
