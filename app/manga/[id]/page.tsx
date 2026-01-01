'use client';

import React, { useState, useEffect } from 'react';
import { useMangaById } from '@/lib/hooks/useMangaById';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import Navbar from '@/components/layout/Navbar';
import ProtectedImage from '@/components/manga/ProtectedImage';
import CommentSidebar from '@/components/feedback/CommentSidebar';
import AuthModal from '@/components/feedback/AuthModal';
import Link from 'next/link';

export default function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = React.useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentViews, setCurrentViews] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'chapters' | 'comments' | 'info'>('chapters');
  const [isFavoriting, setIsFavoriting] = useState(false); // 添加loading状态

  React.useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const { manga, loading, error } = useMangaById(id || '');
  const { user } = useAuth();
  const toast = useToast();

  // 浏览统计 - 页面加载时+1
  useEffect(() => {
    if (manga && id) {
      fetch(`/api/manga/${id}/view`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentViews(data.views);
          }
        });
    }
  }, [manga, id]);

  // 检查收藏状态
  useEffect(() => {
    if (user && id) {
      fetch(`/api/favorites/check?mangaId=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsFavorited(data.isFavorited);
          }
        })
        .catch(() => setIsFavorited(false));
    }
  }, [user, id]);

  // 获取评论数量
  useEffect(() => {
    if (id) {
      fetch(`/api/comments?mangaId=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const comments = data.comments || {};
            const count = Object.values(comments).filter(
              (comment: any) => comment.mangaId === id
            ).length;
            setCommentCount(count);
          }
        })
        .catch(() => setCommentCount(0));
    }
  }, [id]);

  const handleFavorite = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!id) return;

    // 防止重复点击
    if (isFavoriting) return;

    setIsFavoriting(true); // 开始loading

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mangaId: id }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? '已添加到收藏' : '已取消收藏', 2000);
      } else {
        toast.error(data.error || '操作失败', 2000);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast.error('操作失败', 2000);
    } finally {
      setIsFavoriting(false); // 结束loading
    }
  };

  // 加载状态
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 dark:from-zinc-900 to-white dark:to-zinc-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
          </div>
        </main>
      </>
    );
  }

  // 错误状态
  if (error || !manga) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 dark:from-zinc-900 to-white dark:to-zinc-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">漫画不存在</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || '未找到该漫画'}</p>
            <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              返回首页
            </Link>
          </div>
        </main>
      </>
    );
  }

  const statusText = {
    ongoing: '连载中',
    completed: '已完结',
    hiatus: '暂停',
  };

  const statusColor = {
    ongoing: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    completed: 'bg-slate-50 text-slate-700 border border-slate-200',
    hiatus: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <>
      <Navbar />

      <main className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 dark:from-zinc-900 to-white dark:to-zinc-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
            首页
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{manga.title}</span>
        </div>

        {/* Manga Info Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row gap-8 p-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-64 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={manga.coverImage}
                  alt={manga.title}
                  className="w-full h-full object-cover"
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
            </div>

            {/* Manga Details */}
            <div className="flex-1 space-y-5">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 font-display leading-tight">
                {manga.title}
              </h1>

              {/* Status & Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColor[manga.status]}`}>
                  {statusText[manga.status]}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <span>👤</span>
                  <span>{manga.author}</span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <span>👁</span>
                  <span>{(currentViews || manga.views).toLocaleString()} 阅读</span>
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <span>❤️</span>
                  <span>{manga.likes} 点赞</span>
                </span>
              </div>

              {/* Categories & Tags */}
              <div className="flex flex-wrap gap-2">
                {manga.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200"
                  >
                    {category}
                  </span>
                ))}
                {manga.tags?.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium border border-zinc-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
                {manga.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={`/read/${manga.chapters[0]?.id || ''}`}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>📖</span>
                  <span>开始阅读</span>
                </Link>
                <button
                  onClick={handleFavorite}
                  disabled={isFavoriting}
                  className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    isFavoriting
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } ${
                    isFavorited
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                      : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  {isFavoriting ? (
                    // Loading 状态
                    <>
                      <svg className="w-5 h-5 animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>处理中...</span>
                    </>
                  ) : (
                    // 正常状态
                    <>
                      <span>{isFavorited ? '❤️' : '🤍'}</span>
                      <span>{isFavorited ? '已收藏' : '收藏'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('comments');
                    setShowComments(true);
                  }}
                  className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex items-center gap-2"
                >
                  <span>💬</span>
                  <span>评论 ({commentCount})</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: manga.title,
                        text: manga.description,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex items-center gap-2"
                >
                  <span>🔗</span>
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            {[
              { key: 'chapters' as const, label: '📚 章节列表', count: manga.chapters.length },
              { key: 'comments' as const, label: '💬 评论区', count: commentCount },
              { key: 'info' as const, label: 'ℹ️ 详细信息' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`flex-1 px-6 py-4 font-semibold border-b-2 transition-all ${
                  selectedTab === tab.key
                    ? 'border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 text-sm opacity-75">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'chapters' && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">共 {manga.chapters.length} 话</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {manga.chapters.map((chapter, index) => (
                    <Link
                      key={chapter.id}
                      href={`/read/${chapter.id}`}
                      className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group bg-white dark:bg-zinc-800"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-600 w-12 text-center group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                            {chapter.title}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {chapter.pages.length} 页 · {new Date(chapter.updateTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all text-xl">
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'comments' && (
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">查看所有评论</p>
                <button
                  onClick={() => setShowComments(true)}
                  className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all"
                >
                  打开评论面板
                </button>
              </div>
            )}

            {selectedTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">详细信息</h3>
                <dl className="space-y-4">
                  <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">状态</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">{statusText[manga.status]}</dd>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">作者</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">{manga.author}</dd>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">章节数</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">{manga.chapters.length} 话</dd>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">浏览量</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">{(currentViews || manga.views).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between items-start py-3 border-b border-zinc-100 dark:border-zinc-700">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">点赞数</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">{manga.likes}</dd>
                  </div>
                  <div className="flex justify-between items-start py-3">
                    <dt className="text-zinc-600 dark:text-zinc-400 font-medium">更新时间</dt>
                    <dd className="text-zinc-900 dark:text-zinc-100 font-semibold">
                      {new Date(manga.updateTime).toLocaleString('zh-CN')}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Comment Sidebar */}
      <CommentSidebar
        mangaId={manga.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </>
  );
}
