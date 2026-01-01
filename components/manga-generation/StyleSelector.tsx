'use client';

import { StyleOption, MangaStyle } from '@/types/manga-generation';

interface StyleSelectorProps {
  selectedStyle: MangaStyle;
  onStyleChange: (style: MangaStyle) => void;
  disabled?: boolean;
}

const styles: StyleOption[] = [
  {
    id: 'peach',
    name: '蜜桃灰灰',
    description: '可爱粉嫩，温馨治愈',
    previewImage: '/styles/peach-preview.png',
    referenceImage: '/styles/peach-reference.png'
  },
  {
    id: 'cat',
    name: '暴躁猫',
    description: '夸张搞笑，动感十足',
    previewImage: '/styles/cat-preview.png',
    referenceImage: '/styles/cat-reference.png'
  },
  {
    id: 'doraemon',
    name: '哆啦A梦',
    description: '简约友好，经典怀旧',
    previewImage: '/styles/doraemon-preview.png',
    referenceImage: '/styles/doraemon-reference.png'
  }
];

export default function StyleSelector({ selectedStyle, onStyleChange, disabled }: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          选择漫画风格
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          选择你喜欢的漫画风格，不同的风格会带来不同的视觉体验
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => !disabled && onStyleChange(style.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              ${selectedStyle === style.id
                ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* 风格图标占位 */}
            <div className={`
              w-full aspect-square rounded-lg mb-3 flex items-center justify-center text-4xl
              ${selectedStyle === style.id ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-zinc-100 dark:bg-zinc-700'}
            `}>
              {style.id === 'peach' && '🍑'}
              {style.id === 'cat' && '🐱'}
              {style.id === 'doraemon' && '🤖'}
            </div>

            {/* 风格名称 */}
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {style.name}
            </h4>

            {/* 风格描述 */}
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {style.description}
            </p>

            {/* 选中标记 */}
            {selectedStyle === style.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
