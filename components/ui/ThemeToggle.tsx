'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800
                transition-all duration-200
                border border-zinc-200 dark:border-zinc-700
                text-zinc-600 dark:text-zinc-400
                hover:text-zinc-900 dark:hover:text-zinc-100
                hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
      title={theme === 'light' ? '切换到暗黑模式' : '切换到明亮模式'}
    >
      {theme === 'light' ? (
        // 月亮图标（暗黑模式）
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // 太阳图标（明亮模式）
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
