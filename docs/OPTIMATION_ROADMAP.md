# 芝士AI吃鱼 - 产品优化路线图

> **版本**: v2.0 规划
> **更新日期**: 2025-12-30
> **基于**: PRODUCT_REVIEW.md 深度评测

---

## 📊 优化概览

基于对产品的深度评测，我们将从 **6 个维度** 进行系统化优化：

```
┌─────────────────────────────────────────────────────────┐
│                  芝士AI吃鱼 v2.0                         │
├─────────────────────────────────────────────────────────┤
│  🎨 UI 升级     │  ⚡ 交互优化     │  ✨ 特效增强       │
│  📐 布局重构     │  🚀 功能完善     │  🔧 架构优化       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 第一阶段: 核心体验优化 (Week 1-2)

### 1.1 搜索功能 🔍

**优先级**: P0
**工作量**: 2-3 天

#### 功能设计

```tsx
// 搜索组件位置: components/SearchBar.tsx

interface SearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((q: string) => {
      if (q.length > 0) {
        fetch(`/api/search?q=${encodeURIComponent(q)}`)
          .then(res => res.json())
          .then(data => setSuggestions(data.results));
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  return (
    <div className="relative">
      {/* 搜索输入框 */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2
                              text-zinc-400 w-5 h-5" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder || '搜索漫画、作者、标签...'}
          className="w-full pl-10 pr-4 py-2.5
                   bg-zinc-100 border border-zinc-200 rounded-lg
                   focus:ring-2 focus:ring-emerald-500
                   focus:border-transparent
                   transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-zinc-400 hover:text-zinc-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 搜索建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2
                      bg-white border border-zinc-200 rounded-lg
                      shadow-lg max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
                onSearch(suggestion);
              }}
              className="w-full px-4 py-3 text-left
                       hover:bg-zinc-50
                       flex items-center justify-between
                       transition-colors"
            >
              <span>{suggestion}</span>
              <ArrowRightIcon className="w-4 h-4 text-zinc-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### API 实现

```typescript
// 路由: app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 加载漫画数据
  const mangaData = await scanLocalManga();

  // 搜索标题
  const titleResults = mangaData.filter((manga) =>
    manga.title.toLowerCase().includes(query.toLowerCase())
  );

  // 搜索作者
  const authorResults = mangaData.filter((manga) =>
    manga.author.toLowerCase().includes(query.toLowerCase())
  );

  // 搜索标签
  const tagResults = mangaData.filter((manga) =>
    manga.tags?.some(tag =>
      tag.toLowerCase().includes(query.toLowerCase())
    )
  );

  // 去重合并
  const allResults = Array.from(
    new Set([...titleResults, ...authorResults, ...tagResults])
  );

  return NextResponse.json({
    results: allResults.map(m => m.title),
    count: allResults.length
  });
}
```

#### 集成到首页

```tsx
// app/page.tsx 修改

<section className="container mx-auto px-6 py-12">
  {/* 搜索框 */}
  <div className="mb-8">
    <SearchBar
      onSearch={(query) => {
        // 实现搜索逻辑
        setSearchQuery(query);
      }}
      placeholder="搜索你想了解的 AI 知识点..."
    />
  </div>

  {/* 分类筛选 */}
  {/* ... */}
</section>
```

---

### 1.2 骨架屏加载 📱

**优先级**: P0
**工作量**: 1-2 天

#### 首页骨架屏

```tsx
// components/MangaCardSkeleton.tsx

export default function MangaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden
                  border border-zinc-200
                  animate-pulse">
      {/* 封面占位 */}
      <div className="aspect-[3/4] bg-zinc-100" />

      {/* 内容占位 */}
      <div className="p-4 space-y-3">
        {/* 标题 */}
        <div className="h-5 bg-zinc-100 rounded w-3/4" />

        {/* 作者 */}
        <div className="h-4 bg-zinc-100 rounded w-1/2" />

        {/* 标签 */}
        <div className="flex gap-2">
          <div className="h-6 bg-zinc-100 rounded-full w-16" />
          <div className="h-6 bg-zinc-100 rounded-full w-12" />
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-zinc-100" />

        {/* 统计信息 */}
        <div className="flex justify-between">
          <div className="h-4 bg-zinc-100 rounded w-20" />
          <div className="h-4 bg-zinc-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
```

#### 使用骨架屏

```tsx
// app/page.tsx 修改

import MangaCardSkeleton from '@/components/MangaCardSkeleton';

export default function Home() {
  const { mangaList, loading } = useMangaList();

  return (
    <main>
      <section className="container mx-auto px-6 py-12">
        {loading ? (
          // 加载中 - 显示骨架屏
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          // 实际内容
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {mangaList.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
```

#### 流光动画效果

```css
/* app/globals.css 添加 */

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* 使用 */
<div className="aspect-[3/4] skeleton" />
```

---

### 1.3 阅读器预加载 ⚡

**优先级**: P0
**工作量**: 2-3 天

#### 预加载相邻页面

```tsx
// app/read/[id]/page.tsx 修改

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const { chapter, loading } = useChapterById(id || '');
  const [currentPage, setCurrentPage] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Map<number, HTMLImageElement>>(new Map());

  // 预加载相邻页面（当前页前后各2页）
  useEffect(() => {
    if (!chapter) return;

    const preloadRange = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];

    const newPreloaded = new Map(preloadedImages);

    preloadRange.forEach(pageIndex => {
      // 越界检查
      if (pageIndex < 0 || pageIndex >= chapter.pages.length) return;

      // 已加载则跳过
      if (newPreloaded.has(pageIndex)) return;

      // 预加载图片
      const img = new Image();
      img.src = chapter.pages[pageIndex];
      newPreloaded.set(pageIndex, img);
    });

    setPreloadedImages(newPreloaded);
  }, [currentPage, chapter]);

  // 清理不需要的预加载（内存优化）
  useEffect(() => {
    const keepRange = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];

    setPreloadedImages(prev => {
      const next = new Map();
      prev.forEach((img, index) => {
        if (keepRange.includes(index)) {
          next.set(index, img);
        }
      });
      return next;
    });
  }, [currentPage]);

  return (
    // ... 阅读器 UI
  );
}
```

#### 显示预加载状态

```tsx
// 增加预加载进度指示

<div className="fixed bottom-4 left-1/2 -translate-x-1/2
              bg-black/80 text-white px-4 py-2 rounded-full
              text-sm flex items-center gap-2">
  <span>已预加载</span>
  <span className="font-semibold">{preloadedImages.size}</span>
  <span>/</span>
  <span>{chapter?.pages.length || 0}</span>
  <span>页</span>
</div>
```

---

### 1.4 移动端导航菜单 📱

**优先级**: P0
**工作量**: 1-2 天

#### 响应式导航

```tsx
// components/Navbar.tsx 修改

import { useState } from 'react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md
                    border-b border-zinc-200">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🧀</span>
              <span className="text-lg font-semibold">芝士AI吃鱼</span>
            </Link>

            {/* 桌面端菜单 */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-zinc-600 hover:text-emerald-600">
                首页
              </Link>
              <Link href="/categories" className="text-zinc-600 hover:text-emerald-600">
                分类
              </Link>
              <Link href="/ranking" className="text-zinc-600 hover:text-emerald-600">
                排行榜
              </Link>
              <div className="flex items-center gap-3">
                {user ? (
                  // ... 用户信息
                ) : (
                  <button onClick={() => setShowAuthModal(true)}>
                    登录 / 注册
                  </button>
                )}
              </div>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单面板 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-600"
              >
                首页
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-600"
              >
                分类
              </Link>
              <Link
                href="/ranking"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-zinc-600"
              >
                排行榜
              </Link>
              <div className="pt-4 border-t border-zinc-200">
                {user ? (
                  // ... 用户信息
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg"
                  >
                    登录 / 注册
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
```

---

### 1.5 漫画详情页 📖

**优先级**: P0
**工作量**: 3-4 天

#### 详情页设计

```tsx
// app/manga/[id]/page.tsx

'use client';

import { useMangaById } from '@/lib/hooks/useMangaById';
import { useState } from 'react';
import Link from 'next/link';

export default function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const { manga, loading } = useMangaById(id || '');
  const [selectedTab, setSelectedTab] = useState<'chapters' | 'comments' | 'info'>('chapters');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!manga) {
    return <div>漫画不存在</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero 区域 */}
      <div className="bg-white border-b border-zinc-200">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* 封面 */}
              <div className="w-full md:w-80 flex-shrink-0">
                <img
                  src={manga.coverImage}
                  alt={manga.title}
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>

              {/* 信息 */}
              <div className="flex-1">
                {/* 标题 */}
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                  {manga.title}
                </h1>

                {/* 作者 */}
                <p className="text-lg text-zinc-600 mb-6">
                  作者: {manga.author}
                </p>

                {/* 简介 */}
                <p className="text-zinc-700 leading-relaxed mb-6">
                  {manga.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {manga.categories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-emerald-50
                                        text-emerald-700 rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                  {manga.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-zinc-100
                                        text-zinc-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计 */}
                <div className="flex items-center gap-6 text-sm text-zinc-600 mb-8">
                  <div className="flex items-center gap-2">
                    <span>👁</span>
                    <span>{manga.views.toLocaleString()} 阅读</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❤️</span>
                    <span>{manga.likes} 点赞</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <span>{manga.chapters.length} 章节</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/read/${manga.chapters[0]?.id}`}
                    className="px-6 py-3 bg-emerald-600 text-white
                           rounded-lg font-medium hover:bg-emerald-700
                           transition-colors"
                  >
                    开始阅读
                  </Link>
                  <button className="px-6 py-3 border-2 border-emerald-600
                                  text-emerald-600 rounded-lg font-medium
                                  hover:bg-emerald-50 transition-colors">
                    收藏
                  </button>
                  <button className="px-6 py-3 border-2 border-zinc-200
                                  text-zinc-600 rounded-lg font-medium
                                  hover:bg-zinc-50 transition-colors">
                    分享
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tab 切换 */}
          <div className="flex border-b border-zinc-200 mb-8">
            {[
              { key: 'chapters', label: '章节列表', count: manga.chapters.length },
              { key: 'comments', label: '评论' },
              { key: 'info', label: '详细信息' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  selectedTab === tab.key
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-sm text-zinc-400">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          {selectedTab === 'chapters' && (
            <div className="space-y-3">
              {manga.chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  href={`/read/${chapter.id}`}
                  className="flex items-center justify-between
                           p-4 bg-white border border-zinc-200 rounded-lg
                           hover:border-emerald-300 hover:shadow-md
                           transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-zinc-300 w-12">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-zinc-900">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {chapter.pages.length} 页 · {chapter.updateTime}
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-400">→</span>
                </Link>
              ))}
            </div>
          )}

          {selectedTab === 'comments' && (
            <CommentSidebar mangaId={manga.id} />
          )}

          {selectedTab === 'info' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-6">
              <h3 className="font-semibold text-zinc-900 mb-4">详细信息</h3>
              <dl className="space-y-4">
                <div className="flex">
                  <dt className="w-24 text-zinc-600">状态</dt>
                  <dd className="text-zinc-900">
                    {manga.status === 'ongoing' ? '连载中' :
                     manga.status === 'completed' ? '已完结' : '暂停'}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-zinc-600">更新时间</dt>
                  <dd className="text-zinc-900">{manga.updateTime}</dd>
                </div>
                {/* ... 更多信息 */}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 第二阶段: 体验增强 (Week 3-4)

### 2.1 暗黑模式 🌙

**优先级**: P1
**工作量**: 2-3 天

#### 主题系统架构

```tsx
// lib/contexts/ThemeContext.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从 localStorage 读取
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 更新 DOM
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // 保存到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

#### CSS 变量配置

```css
/* app/globals.css 修改 */

:root {
  /* Light 模式 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAF9;
  --bg-tertiary: #F5F5F4;
  --text-primary: #09090B;
  --text-secondary: #71717A;
  --text-muted: #A1A1AA;
  --border-light: #E4E4E7;
}

.dark {
  /* Dark 模式 */
  --bg-primary: #09090B;
  --bg-secondary: #18181B;
  --bg-tertiary: #27272A;
  --text-primary: #FAFAF9;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --border-light: #27272A;
}

/* 使用 CSS 变量 */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border-color: var(--border-light);
}
```

#### 主题切换按钮

```tsx
// components/ThemeToggle.tsx

'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800
                transition-colors"
      aria-label="切换主题"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
}
```

---

### 2.2 双页阅读模式 📖

**优先级**: P1
**工作量**: 2-3 天

#### 阅读模式扩展

```tsx
// app/read/[id]/page.tsx 修改

type ReaderMode = 'page' | 'strip' | 'double-page';

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const [mode, setMode] = useState<ReaderMode>('page');
  const [currentPage, setCurrentPage] = useState(0);

  // 翻页逻辑
  const nextPage = () => {
    const step = mode === 'double-page' ? 2 : 1;
    if (currentPage + step < totalPages) {
      setCurrentPage(currentPage + step);
    }
  };

  const prevPage = () => {
    const step = mode === 'double-page' ? 2 : 1;
    if (currentPage - step >= 0) {
      setCurrentPage(currentPage - step);
    }
  };

  return (
    <div>
      {/* 模式切换 */}
      <div className="flex gap-2">
        <button onClick={() => setMode('page')}>翻页</button>
        <button onClick={() => setMode('strip')}>条漫</button>
        <button onClick={() => setMode('double-page')}>双页</button>
      </div>

      {/* 内容渲染 */}
      {mode === 'double-page' ? (
        <div className="grid grid-cols-2 gap-4">
          <img src={chapter.pages[currentPage]} />
          {currentPage + 1 < totalPages && (
            <img src={chapter.pages[currentPage + 1]} />
          )}
        </div>
      ) : mode === 'strip' ? (
        // 条漫模式
      ) : (
        // 单页模式
      )}
    </div>
  );
}
```

---

### 2.3 排序功能 📊

**优先级**: P1
**工作量**: 1-2 天

```tsx
// components/SortOptions.tsx

type SortOption = 'latest' | 'popular' | 'views' | 'likes';

interface SortProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export default function SortOptions({ value, onChange }: SortProps) {
  const options = [
    { value: 'latest' as SortOption, label: '最新更新' },
    { value: 'popular' as SortOption, label: '最受欢迎' },
    { value: 'views' as SortOption, label: '浏览最多' },
    { value: 'likes' as SortOption, label: '点赞最多' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-600">排序:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3 py-2 bg-white border border-zinc-200 rounded-lg
                  focus:ring-2 focus:ring-emerald-500
                  text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// 使用
const [sortBy, setSortBy] = useState<SortOption>('latest');

const sortedList = useMemo(() => {
  return [...mangaList].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'likes':
        return (b.likes || 0) - (a.likes || 0);
      default:
        return 0;
    }
  });
}, [mangaList, sortBy]);
```

---

### 2.4 分页加载 📄

**优先级**: P1
**工作量**: 2-3 天

```tsx
// app/page.tsx 修改

const PAGE_SIZE = 12;

export default function Home() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [displayedManga, setDisplayedManga] = useState<MangaListItem[]>([]);

  // 加载更多
  const loadMore = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const newItems = mangaList.slice(start, end);

    setDisplayedManga(prev => [...prev, ...newItems]);
    setHasMore(end < mangaList.length);
    setPage(page + 1);
  };

  return (
    <div>
      {/* 漫画列表 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {displayedManga.map(manga => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            className="px-8 py-3 bg-white border-2 border-emerald-600
                     text-emerald-600 rounded-lg font-medium
                     hover:bg-emerald-50 transition-colors"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 第三阶段: 性能优化 (Week 5-6)

### 3.1 虚拟滚动

使用 `@tanstack/react-virtual` 实现虚拟滚动。

### 3.2 图片优化

```tsx
// 使用 Next.js Image 组件
import Image from 'next/image';

<Image
  src={manga.coverImage}
  width={300}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  alt={manga.title}
  loading="lazy"
/>
```

### 3.3 代码分割

```tsx
// 动态导入组件
const CommentSidebar = dynamic(() => import('@/components/CommentSidebar'), {
  loading: () => <div>加载中...</div>,
  ssr: false,
});
```

---

## 📋 实施检查清单

### Week 1-2 核心体验
- [ ] 搜索功能
- [ ] 骨架屏
- [ ] 阅读器预加载
- [ ] 移动端菜单
- [ ] 漫画详情页

### Week 3-4 体验增强
- [ ] 暗黑模式
- [ ] 双页阅读
- [ ] 排序功能
- [ ] 分页加载

### Week 5-6 性能优化
- [ ] 虚拟滚动
- [ ] 图片优化
- [ ] 代码分割
- [ ] CDN 配置

---

## 🎯 成功指标

| 指标 | 当前 | 目标 | 测量方式 |
|------|------|------|---------|
| 首屏加载时间 | ~2s | <1s | Lighthouse |
| 阅读器翻页速度 | ~500ms | <200ms | 性能监控 |
| 移动端可用性 | 70/100 | >90/100 | Lighthouse |
| 用户留存率 | N/A | >60% | 数据分析 |
| 日活跃用户 | N/A | +50% | 统计分析 |

---

**文档版本**: v1.0
**最后更新**: 2025-12-30
**负责人**: 产品团队
**审核人**: 技术团队
