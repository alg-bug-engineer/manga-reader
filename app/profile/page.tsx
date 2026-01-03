'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/manga/MangaCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserFavorites, getUserBookshelf, getUserMangaByUploader, getUserReadingProgress, getBookshelfStats } from '@/lib/storage';
import { Manga, MangaListItem } from '@/types/manga';
import { UserManga } from '@/lib/storage';

type TabType = 'uploads' | 'favorites' | 'bookshelf' | 'info';

// 将 Manga 转换为 MangaListItem
function mangaToListItem(manga: Manga): MangaListItem {
  return {
    id: manga.id,
    title: manga.title,
    author: manga.author,
    coverImage: manga.coverImage,
    status: manga.status,
    categories: manga.categories,
    tags: manga.tags || [],
    latestChapter: manga.chapters[manga.chapters.length - 1]?.title || '暂无章节',
    updateTime: manga.updateTime,
    views: manga.views,
    likes: manga.likes || 0,
  };
}

// 将 UserManga 转换为 MangaListItem
function userMangaToListItem(userManga: UserManga): MangaListItem {
  return {
    id: userManga.id,
    title: userManga.title,
    author: '我', // 用户上传
    coverImage: userManga.coverImage,
    status: userManga.status === 'approved' ? 'completed' : 'ongoing',
    categories: userManga.categories,
    tags: userManga.tags,
    latestChapter: `${userManga.chapters.length} 章`,
    updateTime: userManga.updatedAt,
    views: userManga.views,
    likes: userManga.likes,
  };
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('uploads');
  const [userMangas, setUserMangas] = useState<UserManga[]>([]);
  const [favorites, setFavorites] = useState<Manga[]>([]);
  const [bookshelf, setBookshelf] = useState<any[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 过滤状态
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 并行加载所有数据
      const [mangaRes, favRes, shelfRes, progressRes] = await Promise.all([
        fetch('/api/user/manga'),
        fetch('/api/user/favorites'),
        fetch('/api/user/bookshelf'),
        fetch('/api/user/reading-progress'),
      ]);

      const [mangaData, favData, shelfData, progressData] = await Promise.all([
        mangaRes.json(),
        favRes.json(),
        shelfRes.json(),
        progressRes.json(),
      ]);

      if (mangaData.success) setUserMangas(mangaData.mangas || []);
      if (favData.success) setFavorites(favData.favorites || []);
      if (shelfData.success) setBookshelf(shelfData.bookshelf || []);
      if (progressData.success) setReadingProgress(progressData.progress || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('加载数据失败', 2000);
    } finally {
      setLoading(false);
    }
  };

  // 过滤用户上传
  const filteredUserMangas = userMangas.filter(manga => {
    if (statusFilter === 'all') return true;
    return manga.status === statusFilter;
  });

  // 状态标签样式
  const getStatusBadge = (status: UserManga['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusText = (status: UserManga['status']) => {
    switch (status) {
      case 'pending':
        return '审核中';
      case 'approved':
        return '已上架';
      case 'rejected':
        return '未通过';
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">正在加载...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null; // 会重定向到登录页
  }

  const stats = {
    uploads: userMangas.length,
    approved: userMangas.filter(m => m.status === 'approved').length,
    pending: userMangas.filter(m => m.status === 'pending').length,
    favorites: favorites.length,
    bookshelf: bookshelf.length,
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
        <div className="container mx-auto px-6 py-12">
          {/* 用户信息卡片 */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* 头像 */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {user.username}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>

              {/* 统计信息 */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.uploads}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">上传</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.favorites}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">收藏</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.bookshelf}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">书架</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm">
            {/* Tab 头部 */}
            <div className="border-b border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('uploads')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'uploads'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  我的上传
                  {stats.pending > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium border border-orange-200 dark:border-orange-800">
                      {stats.pending}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'favorites'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  我的收藏
                </button>

                <button
                  onClick={() => setActiveTab('bookshelf')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'bookshelf'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  我的书架
                </button>

                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'info'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-800 shadow-sm'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  个人信息
                </button>
              </div>
            </div>

            {/* Tab 内容 */}
            <div className="p-6">
              {/* 我的上传 */}
              {activeTab === 'uploads' && (
                <div>
                  {/* 操作栏 */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    {/* 状态筛选 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { value: 'all', label: '全部', count: stats.uploads },
                        { value: 'pending', label: '待审核', count: stats.pending },
                        { value: 'approved', label: '已通过', count: stats.approved },
                        { value: 'rejected', label: '未通过', count: stats.uploads - stats.approved - stats.pending },
                      ].map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setStatusFilter(filter.value as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            statusFilter === filter.value
                              ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md'
                              : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500'
                          }`}
                        >
                          {filter.label} <span className={`font-bold ${statusFilter === filter.value ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>({filter.count})</span>
                        </button>
                      ))}
                    </div>

                    {/* 上传按钮 */}
                    <Link
                      href="/upload"
                      className="px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      上传新漫画
                    </Link>
                  </div>

                  {/* 上传列表 */}
                  {filteredUserMangas.length > 0 ? (
                    <div className="space-y-4">
                      {filteredUserMangas.map((manga) => (
                        <div
                          key={manga.id}
                          className="bg-white dark:bg-zinc-700/50 rounded-xl p-5 border border-gray-200 dark:border-zinc-600 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md transition-all"
                        >
                          <div className="flex gap-4">
                            {/* 封面 */}
                            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600 border border-gray-300 dark:border-zinc-500 shadow-sm">
                              {manga.coverImage ? (
                                <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* 信息 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                                    {manga.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {manga.description}
                                  </p>
                                </div>
                                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(manga.status)}`}>
                                  {getStatusText(manga.status)}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span className="font-semibold">{manga.chapters.length} 章节</span>
                                <span>{manga.views.toLocaleString()} 浏览</span>
                                <span>{manga.likes.toLocaleString()} 点赞</span>
                                <span className="text-gray-400 dark:text-gray-500">{new Date(manga.updatedAt).toLocaleDateString('zh-CN')}</span>
                              </div>

                              {manga.status === 'rejected' && manga.rejectReason && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                                  <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                                    <strong>拒绝原因:</strong> {manga.rejectReason}
                                  </p>
                                </div>
                              )}

                              {/* 操作按钮 */}
                              <div className="flex gap-2">
                                <Link
                                  href={`/manga/${manga.id}`}
                                  className="inline-flex items-center px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
                                >
                                  查看详情
                                </Link>
                                {manga.status === 'pending' && (
                                  <span className="inline-flex items-center px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold border border-yellow-200 dark:border-yellow-700">
                                    等待审核中...
                                  </span>
                                )}
                                {manga.status === 'rejected' && (
                                  <Link
                                    href={`/upload/edit/${manga.id}`}
                                    className="inline-flex items-center px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-600 transition-all"
                                  >
                                    重新编辑
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-4">
                        {statusFilter === 'all' ? '还没有上传任何漫画' : '该状态下没有漫画'}
                      </p>
                      {statusFilter === 'all' && (
                        <Link
                          href="/upload"
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium hover:underline transition-all"
                        >
                          上传第一本漫画 →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 我的收藏 */}
              {activeTab === 'favorites' && (
                <div>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {favorites.map((manga, index) => (
                        <MangaCard key={manga.id} manga={mangaToListItem(manga)} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl">
                      <div className="text-6xl mb-4">💝</div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-4">还没有收藏任何漫画</p>
                      <Link
                        href="/"
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium hover:underline transition-all"
                      >
                        去浏览漫画 →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* 我的书架 */}
              {activeTab === 'bookshelf' && (
                <div>
                  {bookshelf.length > 0 ? (
                    <div className="space-y-4">
                      {bookshelf.map((item) => (
                        <div
                          key={item.id}
                          className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-600">
                              {item.mangaCover ? (
                                <img src={item.mangaCover} alt={item.mangaTitle} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-2xl">
                                  📚
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                {item.mangaTitle}
                              </h3>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{item.author}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'reading' ? 'bg-blue-100 text-blue-700' :
                                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  item.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.status === 'reading' ? '阅读中' :
                                   item.status === 'completed' ? '已完成' :
                                   item.status === 'planned' ? '计划阅读' : '已放弃'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-lg">书架空空如也</p>
                    </div>
                  )}
                </div>
              )}

              {/* 个人信息 */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">账号信息</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <span className="text-zinc-600 dark:text-zinc-400">用户名</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <span className="text-zinc-600 dark:text-zinc-400">邮箱</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-700">
                        <span className="text-zinc-600 dark:text-zinc-400">注册时间</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {new Date(user.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">学习统计</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {readingProgress.length}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">阅读过</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.favorites}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">收藏</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.approved}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">已发布</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.pending}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">审核中</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
