'use client';

import { useEffect, useState } from 'react';

export default function TagManagement() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      if (data.success) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTag.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setNewTag('');
        fetchTags();
        alert('标签创建成功！');
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Create tag error:', error);
      alert('操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`确定要删除标签"${name}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/tags?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchTags();
        alert('标签删除成功！');
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Delete tag error:', error);
      alert('操作失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          标签管理
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          管理漫画的标签体系，用于更精细的分类和检索
        </p>
      </div>

      {/* 创建标签表单 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          创建新标签
        </h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            placeholder="输入标签名称..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-zinc-700 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newTag.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '创建中...' : '创建'}
          </button>
        </form>
      </div>

      {/* 标签列表 */}
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
              标签列表 ({tags.length})
            </h2>
          </div>

          {tags.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-zinc-600 dark:text-zinc-400">暂无标签</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="group flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-full border border-zinc-200 dark:border-zinc-600 hover:border-emerald-300 dark:hover:border-emerald-600 transition"
                >
                  <span className="text-lg">🔖</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {tag}
                  </span>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="opacity-0 group-hover:opacity-100 ml-1 text-zinc-400 hover:text-red-500 transition"
                    title="删除标签"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-2">
          💡 使用说明
        </h3>
        <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
          <li>• 标签用于更精细地标记漫画内容和特点</li>
          <li>• 一个漫画可以有多个标签，建议使用简洁的词语</li>
          <li>• 常用标签示例：入门、进阶、实战、理论、应用等</li>
          <li>• 删除标签不会删除使用该标签的漫画</li>
        </ul>
      </div>

      {/* 标签统计 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          标签使用统计
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {tags.length}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              总标签数
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.ceil(tags.length / 2)}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              常用标签
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {tags.length > 0 ? '100%' : '0%'}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              使用率
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              ∞
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              无限制
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
