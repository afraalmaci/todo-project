import React from 'react';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { badge: 'w-7 h-7 rounded-lg text-sm', text: 'text-base' },
    md: { badge: 'w-8 h-8 rounded-[10px] text-base', text: 'text-lg' },
    lg: { badge: 'w-9 h-9 rounded-[10px] text-lg', text: 'text-xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5 select-none">
      <span
        className={`${s.badge} flex items-center justify-center bg-sage-200 text-sage-700`}
        aria-hidden="true"
      >
        🌱
      </span>
      <span className={`font-extrabold tracking-tight text-ink ${s.text}`}>
        Bloom
      </span>
    </div>
  );
}
