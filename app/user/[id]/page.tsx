'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/manga/MangaCard';
import Link from 'next/link';
import { Manga, MangaListItem } from '@/types/manga';

interface UserData {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

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

export default function UserPage() {
  const params = useParams();
  const userId = params.id as string;
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${userId}`);

        if (!response.ok) {
          throw new Error('加载失败');
        }

        const data = await response.json();

        if (data.success) {
          setUserData(data.user);
          setFavorites(data.favorites);
        } else {
          setError(data.error || '加载失败');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // 检查是否是当前用户自己的主页
  const isOwnProfile = user?.id === userId;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-stone-600">正在加载...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">加载失败</h2>
            <p className="text-stone-600 mb-6">{error || '用户不存在'}</p>
            <Link
              href="/"
              className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
            >
              返回首页
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-6 py-12">
          {/* 用户信息卡片 */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* 头像 */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {userData.username.charAt(0).toUpperCase()}
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-stone-900 mb-2">
                  {userData.username}
                </h1>
                <p className="text-stone-600 mb-1">{userData.email}</p>
                <p className="text-sm text-stone-500">
                  注册于 {new Date(userData.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>

              {/* 统计信息 */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-600">
                    {favorites.length}
                  </div>
                  <div className="text-sm text-stone-600">收藏</div>
                </div>
              </div>
            </div>
          </div>

          {/* 收藏列表 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-900 font-display">
                ❤️ 我的收藏
              </h2>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {favorites.map((manga, index) => (
                  <MangaCard key={manga.id} manga={mangaToListItem(manga)} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-stone-500 text-lg mb-4">
                  {isOwnProfile ? '你还没有收藏任何漫画' : '该用户还没有收藏'}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/"
                    className="text-violet-600 hover:text-violet-700 font-medium hover:underline transition-all"
                  >
                    去浏览漫画 →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
