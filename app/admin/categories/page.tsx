'use client';

import { useEffect, useState } from 'react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setNewCategory('');
        fetchCategories();
        alert('分类创建成功！');
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Create category error:', error);
      alert('操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`确定要删除分类"${name}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/categories?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories();
        alert('分类删除成功！');
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      alert('操作失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          分类管理
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          管理漫画的分类体系，可以添加或删除分类
        </p>
      </div>

      {/* 创建分类表单 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          创建新分类
        </h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            placeholder="输入分类名称..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCategory.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '创建中...' : '创建'}
          </button>
        </form>
      </div>

      {/* 分类列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">加载中...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              分类列表 ({categories.length})
            </h2>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-zinc-600 dark:text-zinc-400">暂无分类</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏷️</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(category)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
          💡 使用说明
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• 分类用于组织和浏览漫画，建议创建有意义的分类名称</li>
          <li>• 删除分类不会删除属于该分类的漫画</li>
          <li>• 每个漫画可以属于多个分类</li>
          <li>• 系统会根据data/目录结构自动识别分类</li>
        </ul>
      </div>
    </div>
  );
}
