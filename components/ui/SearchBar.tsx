'use client';

import { useState, useEffect, useMemo } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        // 这里可以调用搜索API
        // 目前先从全局数据中搜索
        fetch(`/api/manga/local`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const results = data.data.filter((manga: any) =>
                manga.title.toLowerCase().includes(query.toLowerCase()) ||
                manga.author.toLowerCase().includes(query.toLowerCase()) ||
                manga.categories.some((cat: string) =>
                  cat.toLowerCase().includes(query.toLowerCase())
                ) ||
                manga.tags?.some((tag: string) =>
                  tag.toLowerCase().includes(query.toLowerCase())
                )
              ).map((manga: any) => manga.title);

              setSuggestions(results.slice(0, 5)); // 最多显示5个建议
            }
          });
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* 搜索图标 */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 搜索输入框 */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder || '搜索漫画、作者、标签...'}
            className="w-full pl-10 pr-10 py-3
                     bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl
                     focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent
                     transition-all duration-200
                     text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400"
          />

          {/* 清除按钮 */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onSearch('');
                setSuggestions([]);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* 搜索建议下拉框 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2
                      bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl
                      shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left
                       hover:bg-zinc-50 dark:hover:bg-zinc-700
                       flex items-center justify-between
                       transition-colors duration-150
                       group"
            >
              <span className="text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {suggestion}
              </span>
              <svg
                className="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                         transition-colors opacity-0 group-hover:opacity-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* 无搜索结果提示 */}
      {showSuggestions && query.length > 0 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2
                      bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl
                      shadow-lg p-4 text-center text-zinc-500 dark:text-zinc-400">
          未找到相关结果
        </div>
      )}
    </div>
  );
}
