'use client';

import { useMangaList } from '@/lib/hooks/useMangaData';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/manga/MangaCard';
import SearchBar from '@/components/ui/SearchBar';
import MangaCardSkeleton from '@/components/manga/MangaCardSkeleton';
import SortOptions from '@/components/ui/SortOptions';
import { useState, useMemo, useEffect } from 'react';
import { aiCategories, getAllTags } from '@/lib/data';

type SortOption = 'latest' | 'popular' | 'views' | 'likes';

interface Stats {
  userCount: number;
  totalViews: number;
  mangaCount: number;
}

export default function Home() {
  const { mangaList, loading, error, rawData } = useMangaList();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [displayCount, setDisplayCount] = useState(12); // 每页显示12个
  const [stats, setStats] = useState<Stats>({ userCount: 0, totalViews: 0, mangaCount: 0 });
  const [popularManga, setPopularManga] = useState<typeof mangaList>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // 获取所有标签
  useEffect(() => {
    const tags = getAllTags();
    setAllTags(tags);
  }, [mangaList]);

  // 获取网站统计数据
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  // 获取人气推荐（基于点赞数）
  useEffect(() => {
    if (mangaList.length > 0) {
      // 按点赞数排序，取top5
      const sorted = [...mangaList]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);
      setPopularManga(sorted);
    }
  }, [mangaList]);

  // 根据分类、标签和搜索关键词筛选
  const filteredMangaList = useMemo(() => {
    let filtered = mangaList;

    // 先按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((manga) =>
        manga.title.toLowerCase().includes(query) ||
        manga.author.toLowerCase().includes(query) ||
        manga.categories.some(cat => cat.toLowerCase().includes(query)) ||
        manga.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 再按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter((manga) =>
        manga.categories.includes(selectedCategory)
      );
    }

    // 最后按标签筛选（如果选择了标签）
    if (selectedTag) {
      filtered = filtered.filter((manga) =>
        manga.tags.includes(selectedTag)
      );
    }

    return filtered;
  }, [mangaList, selectedCategory, selectedTag, searchQuery]);

  // 排序
  const sortedMangaList = useMemo(() => {
    const sorted = [...filteredMangaList];

    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) =>
          new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
        );
      case 'popular':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'views':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'likes':
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      default:
        return sorted;
    }
  }, [filteredMangaList, sortBy]);

  // 分页：当前显示的漫画列表
  const displayedMangaList = useMemo(() => {
    return sortedMangaList.slice(0, displayCount);
  }, [sortedMangaList, displayCount]);

  // 是否还有更多
  const hasMore = displayedMangaList.length < sortedMangaList.length;

  // 加载更多
  const loadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  // 加载状态 - 使用骨架屏
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white dark:bg-zinc-900">
          {/* Hero 区域 */}
          <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-700">
            <div className="container mx-auto px-6 py-16 md:py-20">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 font-display leading-tight">
                通过生动有趣的漫画形式，
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  轻松掌握人工智能前沿技术
                </span>
              </h1>
            </div>
          </section>

          {/* 骨架屏 */}
          <section className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <MangaCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </main>
      </>
    );
  }

  // 错误状态
  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">加载失败</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-600 transition font-medium"
            >
              重新加载
            </button>
          </div>
        </main>
      </>
    );
  }

  // 空数据状态
  if (mangaList.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">📁</div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">暂无数据</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              请在 data 文件夹中添加漫画数据，或检查 API 配置
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white dark:bg-zinc-900">
        {/* Hero Section + Search */}
        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-700">
          <div className="container mx-auto px-6 py-12 md:py-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5
                          bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md
                          text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AI知识科普，轻松学习</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 font-display
                         leading-tight">
              通过生动有趣的漫画形式，
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                轻松掌握人工智能前沿技术
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              机器学习 · 深度学习 · NLP · CV · 大模型 · 强化学习
            </p>

            {/* 搜索框 */}
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="搜索你想了解的 AI 知识点..."
            />
          </div>
        </section>

        {/* Category Filter & Sort Section */}
        <section className="sticky top-[59px] z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700">
          <div className="container mx-auto px-6 py-4">
            {/* 分类筛选 + 排序 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              {/* Category Filter */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {aiCategories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedTag(null);
                    }}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200
                             text-sm border whitespace-nowrap ${selectedCategory === category
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <SortOptions
                value={sortBy}
                onChange={setSortBy}
                count={filteredMangaList.length}
              />
            </div>

            {/* Tag Filter */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap px-2">标签:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedTag === null
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results Info */}
            {(selectedCategory !== '全部' || selectedTag) && (
              <div className="mt-3 text-zinc-600 dark:text-zinc-400 flex items-center gap-2 animate-fade-in text-sm">
                <span>找到</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filteredMangaList.length}</span>
                <span>个</span>
                {selectedCategory !== '全部' && (
                  <>
                    <span>关于</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCategory}</span>
                  </>
                )}
                {selectedTag && (
                  <>
                    {selectedCategory !== '全部' && <span>包含</span>}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedTag}</span>
                  </>
                )}
                <span>的知识点</span>
              </div>
            )}
          </div>
        </section>

        {/* Manga Grid Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 font-display">
              {selectedCategory === '全部' ? '🔥 最新更新' : `📖 ${selectedCategory}系列`}
            </h2>
          </div>

          {sortedMangaList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {displayedMangaList.map((manga, index) => (
                  <MangaCard key={manga.id} manga={manga} index={index} showLikeButton={true} />
                ))}
              </div>

              {/* 加载更多按钮 */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-white dark:bg-zinc-800 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-50 dark:hover:bg-zinc-700 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>加载更多</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 显示进度 */}
              <div className="text-center mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                显示 {displayedMangaList.length} / {sortedMangaList.length} 个
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-4">该分类暂无知识点</p>
              <button
                onClick={() => setSelectedCategory('全部')}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium
                       hover:underline transition-all"
              >
                查看全部知识点 →
              </button>
            </div>
          )}
        </section>

        {/* Popular Section */}
        {selectedCategory === '全部' && (
          <section className="container mx-auto px-6 pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 font-display">
                ⭐ 人气推荐
              </h2>
            </div>
            {popularManga.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {popularManga.map((manga, index) => (
                  <MangaCard key={`popular-${manga.id}`} manga={manga} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                暂无推荐数据
              </div>
            )}
          </section>
        )}

        {/* Stats Section - 极简风格 */}
        <section className="container mx-auto px-6 pb-16">
          <div className="bg-gradient-to-r from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20
                        rounded-lg p-8 md:p-12 border border-emerald-100 dark:border-emerald-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-semibold text-emerald-600 dark:text-emerald-400 font-display">
                  {stats.mangaCount}+
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm">优质科普</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-semibold text-teal-600 dark:text-teal-400 font-display">
                  {rawData.reduce((sum: number, m) => sum + (m.chapters?.length || 0), 0)}+
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm">精彩章节</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-semibold text-cyan-600 dark:text-cyan-400 font-display">
                  {stats.totalViews.toLocaleString()}+
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm">总浏览量</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-semibold text-green-600 dark:text-green-400 font-display">
                  {stats.userCount}+
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm">注册用户</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - 极简风格 */}
      <footer className="bg-zinc-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🧀</span>
              <h3 className="text-2xl font-semibold font-display">
                芝士AI吃鱼
              </h3>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-lg max-w-2xl mx-auto leading-relaxed">
              致力于用生动有趣的漫画形式，普及人工智能前沿技术知识
              <br />
              让学习AI变得简单有趣
            </p>

            {/* Copyright */}
            <div className="pt-8 border-t border-zinc-800">
              <p className="text-zinc-400 text-sm">
                © 2025 芝士AI吃鱼 · Made with ❤️ for AI Education
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
