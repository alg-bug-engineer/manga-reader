'use client';

import { useEffect, useState } from 'react';

interface Stats {
  userCount: number;
  totalViews: number;
  mangaCount: number;
  chapterCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    userCount: 0,
    totalViews: 0,
    mangaCount: 0,
    chapterCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '漫画总数',
      value: stats.mangaCount,
      icon: '📚',
      color: 'emerald',
      description: '已上架漫画',
    },
    {
      title: '章节总数',
      value: stats.chapterCount,
      icon: '📖',
      color: 'blue',
      description: '所有章节',
    },
    {
      title: '总浏览量',
      value: stats.totalViews.toLocaleString(),
      icon: '👁',
      color: 'purple',
      description: '累计浏览',
    },
    {
      title: '注册用户',
      value: stats.userCount,
      icon: '👥',
      color: 'orange',
      description: '总用户数',
    },
  ];

  const quickActions = [
    {
      title: '添加漫画',
      description: '上传新漫画到系统',
      href: '/admin/manga',
      icon: '➕',
    },
    {
      title: '管理分类',
      description: '管理漫画分类体系',
      href: '/admin/categories',
      icon: '🏷️',
    },
    {
      title: '管理标签',
      description: '管理漫画标签',
      href: '/admin/tags',
      icon: '🏷️',
    },
    {
      title: '查看统计',
      description: '查看详细统计数据',
      href: '/admin/stats',
      icon: '📊',
    },
  ];

  const recentActivities = [
    { type: 'upload', message: '上传了新漫画', time: '2小时前', user: '管理员' },
    { type: 'edit', message: '编辑了漫画信息', time: '5小时前', user: '管理员' },
    { type: 'category', message: '添加了新分类', time: '1天前', user: '管理员' },
    { type: 'tag', message: '更新了标签', time: '2天前', user: '管理员' },
  ];

  const activityIcons = {
    upload: '📤',
    edit: '✏️',
    category: '🏷️',
    tag: '🔖',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          仪表盘
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          欢迎回来，管理员！这是您的系统概览。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mt-2`}>
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          快捷操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="flex items-start gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition group"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {action.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {action.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          最近活动
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50"
            >
              <div className="text-2xl">{activityIcons[activity.type as keyof typeof activityIcons]}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {activity.user} {activity.message}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          系统信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              系统版本
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              v1.0.0
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              最后更新
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              运行状态
            </p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              正常
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
