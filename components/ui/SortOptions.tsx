'use client';

import { useState } from 'react';

type SortOption = 'latest' | 'popular' | 'views' | 'likes';

interface SortProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
  count?: number;
}

export default function SortOptions({ value, onChange, count = 0 }: SortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'latest' as SortOption, label: '最新更新', icon: '🕐' },
    { value: 'popular' as SortOption, label: '最受欢迎', icon: '⭐' },
    { value: 'views' as SortOption, label: '浏览最多', icon: '👁' },
    { value: 'likes' as SortOption, label: '点赞最多', icon: '❤️' },
  ];

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      {/* 当前选择按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        <span>{selectedOption?.icon}</span>
        <span>{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {count > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
            {count}
          </span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg min-w-[160px] overflow-hidden animate-slide-in">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex items-center gap-3 ${
                  value === option.value ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="flex-1">{option.label}</span>
                {value === option.value && (
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
