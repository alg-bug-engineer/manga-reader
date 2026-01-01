'use client';

import { useEffect, useState } from 'react';
import { useLocalMangaData } from '@/lib/hooks/useMangaData';

interface StatsData {
  totalManga: number;
  activeManga: number;
  inactiveManga: number;
  totalChapters: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerManga: number;
  categoriesCount: number;
  tagsCount: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: allManga, loading: mangaLoading } = useLocalMangaData();

  useEffect(() => {
    if (!mangaLoading && allManga) {
      calculateStats();
    }
  }, [allManga, mangaLoading]);

  const calculateStats = () => {
    if (!allManga || allManga.length === 0) {
      setStats({
        totalManga: 0,
        activeManga: 0,
        inactiveManga: 0,
        totalChapters: 0,
        totalViews: 0,
        totalLikes: 0,
        avgViewsPerManga: 0,
        categoriesCount: 0,
        tagsCount: 0,
      });
      setLoading(false);
      return;
    }

    // 获取下架漫画列表
    fetch('/api/admin/manga?status=all')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const mangaList = data.manga;
          const activeManga = mangaList.filter((m: any) => m.isActive);
          const inactiveManga = mangaList.filter((m: any) => !m.isActive);

          const totalViews = mangaList.reduce((sum: number, m: any) => sum + (m.views || 0), 0);
          const totalLikes = mangaList.reduce((sum: number, m: any) => sum + (m.likes || 0), 0);
          const totalChapters = mangaList.reduce((sum: number, m: any) => sum + (m.chapters?.length || 0), 0);

          // 获取所有分类和标签
          const allCategories = new Set<string>();
          const allTags = new Set<string>();
          mangaList.forEach((m: any) => {
            m.categories?.forEach((c: string) => allCategories.add(c));
            m.tags?.forEach((t: string) => allTags.add(t));
          });

          setStats({
            totalManga: mangaList.length,
            activeManga: activeManga.length,
            inactiveManga: inactiveManga.length,
            totalChapters,
            totalViews,
            totalLikes,
            avgViewsPerManga: mangaList.length > 0 ? Math.round(totalViews / mangaList.length) : 0,
            categoriesCount: allCategories.size,
            tagsCount: allTags.size,
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch stats:', error);
        setLoading(false);
      });
  };

  if (loading || mangaLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">无法加载统计数据</p>
      </div>
    );
  }

  const statCards = [
    {
      title: '总漫画数',
      value: stats.totalManga,
      icon: '📚',
      color: 'emerald',
      description: '系统中所有漫画',
    },
    {
      title: '已上架',
      value: stats.activeManga,
      icon: '✅',
      color: 'emerald',
      description: '正在展示的漫画',
    },
    {
      title: '已下架',
      value: stats.inactiveManga,
      icon: '⛔',
      color: 'red',
      description: '隐藏的漫画',
    },
    {
      title: '总章节数',
      value: stats.totalChapters,
      icon: '📖',
      color: 'blue',
      description: '所有漫画章节',
    },
    {
      title: '总浏览量',
      value: stats.totalViews.toLocaleString(),
      icon: '👁',
      color: 'purple',
      description: '累计浏览次数',
    },
    {
      title: '总点赞数',
      value: stats.totalLikes.toLocaleString(),
      icon: '❤️',
      color: 'pink',
      description: '用户点赞总数',
    },
    {
      title: '平均浏览量',
      value: stats.avgViewsPerManga.toLocaleString(),
      icon: '📈',
      color: 'orange',
      description: '每本漫画平均',
    },
    {
      title: '分类数量',
      value: stats.categoriesCount,
      icon: '🏷️',
      color: 'indigo',
      description: '漫画分类总数',
    },
    {
      title: '标签数量',
      value: stats.tagsCount,
      icon: '🔖',
      color: 'teal',
      description: '漫画标签总数',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">统计报表</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">查看系统的详细统计数据和指标</p>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{stat.title}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mt-2`}>
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{stat.description}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 数据概览图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 漫画状态分布 */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">漫画状态分布</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">已上架</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalManga > 0 ? Math.round((stats.activeManga / stats.totalManga) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                <div
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalManga > 0 ? (stats.activeManga / stats.totalManga) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">已下架</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {stats.totalManga > 0 ? Math.round((stats.inactiveManga / stats.totalManga) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalManga > 0 ? (stats.inactiveManga / stats.totalManga) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">关键指标</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">总浏览量</span>
              </div>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❤️</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">总点赞数</span>
              </div>
              <span className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.totalLikes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">平均浏览量</span>
              </div>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.avgViewsPerManga.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 系统健康状态 */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">系统健康状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💚</div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">系统状态</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">正常运行</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚡</div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">数据更新</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">实时</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">内容质量</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">优秀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
