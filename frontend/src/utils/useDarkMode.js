import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bloom-theme';

function getInitialIsDark() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    // localStorage can throw in some browser contexts; fall back to light.
  }
  return false;
}

// Applies/removes the `dark` class on <html>, which Tailwind's
// `darkMode: 'class'` setting uses to switch every `dark:` variant.
export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Best-effort only; not having persistence just means the toggle
      // resets next visit.
    }
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((prev) => !prev), []);

  return [isDark, toggleDark];
}
