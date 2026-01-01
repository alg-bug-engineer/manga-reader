'use client';

import React, { useState, useEffect } from 'react';
import ProtectedImage from '@/components/manga/ProtectedImage';
import Link from 'next/link';
import { useChapterById } from '@/lib/hooks/useChapterById';

export default function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const { chapter, loading, error } = useChapterById(id || '');
  const [mode, setMode] = useState<'page' | 'strip' | 'double-page'>('strip');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Map<number, HTMLImageElement>>(new Map());

  const totalPages = chapter?.pages.length || 0;

  // 双页模式：确保只显示偶数页
  const maxDoublePageIndex = totalPages % 2 === 0 ? totalPages : totalPages - 1;

  // 所有hooks必须在任何条件返回之前调用
  const nextPage = () => {
    const step = mode === 'double-page' ? 2 : 1;
    if (currentPage + step < totalPages) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage + step);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  };

  const prevPage = () => {
    const step = mode === 'double-page' ? 2 : 1;
    if (currentPage > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(currentPage - step);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  };

  const goToPage = (page: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  // 预加载相邻页面（当前页前后各2页）
  useEffect(() => {
    if (!chapter || mode === 'strip') return;

    // 双页模式预加载范围更大
    const preloadCount = mode === 'double-page' ? 4 : 2;
    const preloadRange = [
      currentPage - preloadCount,
      ...Array.from({ length: preloadCount * 2 + 1 }, (_, i) => currentPage - preloadCount + i),
      currentPage + preloadCount,
    ].filter(i => i >= 0 && i < totalPages);

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
  }, [currentPage, chapter, mode]);

  // 清理不需要的预加载（内存优化）
  useEffect(() => {
    if (!chapter) return;

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
  }, [currentPage, chapter]);

  // 键盘导航 - 支持翻页模式和双页模式
  useEffect(() => {
    // 只在非加载状态且有数据时才启用键盘导航
    // 条漫模式不需要键盘导航
    if (loading || !chapter || mode === 'strip') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, mode, loading, chapter, totalPages]);

  // 触摸手势导航 - 移动端滑屏翻页
  useEffect(() => {
    // 只在翻页模式和双页模式下启用触摸导航
    if (loading || !chapter || mode === 'strip') {
      return;
    }

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // 最小滑动距离（像素）

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;

      // 向左滑动 → 下一页
      if (swipeDistance < -minSwipeDistance) {
        nextPage();
      }

      // 向右滑动 → 上一页
      if (swipeDistance > minSwipeDistance) {
        prevPage();
      }
    };

    // 添加触摸事件监听
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, mode, loading, chapter, totalPages]);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">章节不存在</h1>
          <p className="text-gray-600 mb-6">{error || '未找到该章节'}</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/manga/${chapter.manga.id}`}
              className="text-gray-600 hover:text-purple-600 transition"
            >
              ← 返回
            </Link>

            <h1 className="text-lg font-semibold text-gray-900 truncate px-4">
              {chapter.title}
            </h1>

            <div className="flex items-center gap-2">
              {/* 阅读模式选择器 - 三个并列按钮 */}
              <div className="flex items-center bg-zinc-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setMode('strip')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    mode === 'strip'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                  }`}
                >
                  📜 条漫
                </button>
                <button
                  onClick={() => setMode('page')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    mode === 'page'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                  }`}
                >
                  📖 单页
                </button>
                <button
                  onClick={() => setMode('double-page')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    mode === 'double-page'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                  }`}
                >
                  📖 双页
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {mode === 'double-page' ? (
          // 双页模式
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg shadow-lg p-4">
              {/* 左页 */}
              {currentPage < totalPages && (
                <img
                  src={chapter.pages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full aspect-[3/4] object-contain rounded-lg"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              )}
              {/* 右页 */}
              {currentPage + 1 < totalPages && (
                <img
                  src={chapter.pages[currentPage + 1]}
                  alt={`Page ${currentPage + 2}`}
                  className="w-full aspect-[3/4] object-contain rounded-lg"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              )}
            </div>

            {/* 双页翻页控制 */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  上一页
                </button>

                <div className="text-center">
                  <span className="text-gray-900 font-medium">
                    {currentPage + 1} - {Math.min(currentPage + 2, totalPages)} / {totalPages}
                  </span>
                  {preloadedImages.size > 0 && (
                    <span className="ml-3 text-xs text-gray-500">
                      已预加载 {preloadedImages.size} 页
                    </span>
                  )}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage + 2 >= totalPages}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  下一页
                </button>
              </div>

              {/* 操作提示 */}
              <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
                  <span>键盘翻页</span>
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <span>👆</span>
                  <span>左右滑动翻页</span>
                </span>
              </div>
            </div>

            {/* 双页页面选择器 */}
            <div className="mt-4 bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">跳转至：</div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                {Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => {
                  const pageIndex = i * 2;
                  const isSelected = currentPage === pageIndex;
                  const isLastPage = totalPages % 2 !== 0 && pageIndex === totalPages - 1;

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageIndex)}
                      disabled={pageIndex >= totalPages}
                      className={`px-3 py-2 text-sm rounded-lg transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                    >
                      {pageIndex + 1}
                      {pageIndex + 1 < totalPages ? `-${pageIndex + 2}` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : mode === 'page' ? (
          // 单页模式
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative aspect-[3/4] bg-gray-100">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <img
                    src={chapter.pages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full h-full object-contain"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                )}
              </div>
            </div>

            {/* Page Navigation */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  上一页
                </button>

                <div className="text-center">
                  <span className="text-gray-900 font-medium">
                    {currentPage + 1} / {totalPages}
                  </span>
                  {/* 预加载状态 */}
                  {preloadedImages.size > 0 && (
                    <span className="ml-3 text-xs text-gray-500">
                      已预加载 {preloadedImages.size} 页
                    </span>
                  )}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  下一页
                </button>
              </div>

              {/* 操作提示 */}
              <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
                  <span>键盘翻页</span>
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <span>👆</span>
                  <span>左右滑动翻页</span>
                </span>
              </div>
            </div>

            {/* Page Selector */}
            <div className="mt-4 bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">跳转至：</div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-2 text-sm rounded-lg transition ${
                      currentPage === i
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 条漫模式
          <div className="max-w-3xl mx-auto space-y-4">
            {chapter.pages.map((page, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="w-full"
                  style={{ aspectRatio: '3/4', objectFit: 'contain' }}
                  loading="lazy"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
