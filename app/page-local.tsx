'use client';

import { useMangaList } from '@/lib/hooks/useMangaData';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/manga/MangaCard';
import { useState, useMemo } from 'react';
import { aiCategories } from '@/lib/data';

export default function Home() {
  const { mangaList, loading, error } = useMangaList();
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // 根据分类筛选
  const filteredMangaList = useMemo(() => {
    if (selectedCategory === '全部') {
      return mangaList;
    }
    return mangaList.filter((manga) =>
      manga.categories.includes(selectedCategory)
    );
  }, [mangaList, selectedCategory]);

  // 加载状态
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-stone-600">正在加载漫画数据...</p>
          </div>
        </main>
      </>
    );
  }

  // 错误状态
  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">加载失败</h2>
            <p className="text-stone-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
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
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">暂无数据</h2>
            <p className="text-stone-600">
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

      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
        {/* Hero Section - 简化版 */}
        <section className="relative overflow-hidden border-b border-stone-200">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2
                            bg-violet-50 border border-violet-200 rounded-full
                            text-violet-700 text-sm font-medium mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span>AI知识科普，轻松学习</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-6 font-display
                           leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                通过生动有趣的漫画形式，
                <br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  轻松掌握人工智能前沿技术
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-stone-600 mb-0 leading-relaxed animate-fade-in"
                 style={{ animationDelay: '200ms' }}>
                机器学习 · 深度学习 · NLP · CV · 大模型 · 强化学习
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter Section - 移到顶部 */}
        <section className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {aiCategories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                           text-sm border whitespace-nowrap ${selectedCategory === category
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-md scale-105'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300 hover:text-violet-600 hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results Info */}
            {selectedCategory !== '全部' && (
              <div className="mt-3 text-stone-600 flex items-center gap-2 animate-fade-in text-sm">
                <span>找到</span>
                <span className="font-bold text-violet-600">{filteredMangaList.length}</span>
                <span>个关于</span>
                <span className="font-bold text-violet-600">{selectedCategory}</span>
                <span>的知识点</span>
              </div>
            )}
          </div>
        </section>

        {/* Manga Grid Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900 font-display">
              {selectedCategory === '全部' ? '🔥 最新更新' : `📖 ${selectedCategory}系列`}
            </h2>
          </div>

          {filteredMangaList.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMangaList.map((manga, index) => (
                <MangaCard key={manga.id} manga={manga} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-stone-500 text-lg mb-4">该分类暂无知识点</p>
              <button
                onClick={() => setSelectedCategory('全部')}
                className="text-violet-600 hover:text-violet-700 font-medium
                       hover:underline transition-all"
              >
                查看全部知识点 →
              </button>
            </div>
          )}
        </section>

        {/* Popular Section - 仅在全部时显示 */}
        {selectedCategory === '全部' && (
          <section className="container mx-auto px-6 pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-900 font-display">
                ⭐ 人气推荐
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {mangaList
                .slice()
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((manga, index) => (
                  <MangaCard key={`popular-${manga.id}`} manga={manga} index={index} />
                ))}
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="container mx-auto px-6 pb-16">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50
                        rounded-3xl p-8 md:p-12 border border-violet-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-violet-600 font-display">
                  {mangaList.length}+
                </div>
                <div className="text-stone-600 text-sm">优质科普</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 font-display">
                  {mangaList.reduce((sum, m) => sum + parseInt(m.latestChapter), 0)}+
                </div>
                <div className="text-stone-600 text-sm">精彩章节</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-fuchsia-600 font-display">
                  {mangaList.reduce((sum, m) => sum + m.views, 0).toLocaleString()}+
                </div>
                <div className="text-stone-600 text-sm">学习用户</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-indigo-600 font-display">
                  持续
                </div>
                <div className="text-stone-600 text-sm">更新中</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-stone-900 to-stone-800 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">🧀</span>
              <h3 className="text-3xl font-bold font-display">
                芝士AI吃鱼
              </h3>
            </div>

            {/* Description */}
            <p className="text-stone-300 text-lg max-w-2xl mx-auto leading-relaxed">
              致力于用生动有趣的漫画形式，普及人工智能前沿技术知识
              <br />
              让学习AI变得简单有趣
            </p>

            {/* Copyright */}
            <div className="pt-8 border-t border-stone-700">
              <p className="text-stone-400 text-sm">
                © 2025 芝士AI吃鱼 · Made with ❤️ for AI Education
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
