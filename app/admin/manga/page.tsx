'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Manga {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  status: string;
  categories: string[];
  tags: string[];
  views: number;
  likes: number;
  isActive: boolean;
}

export default function MangaManagement() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // 编辑相关状态
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMangaList();
    fetchCategoriesAndTags();
  }, [statusFilter]);

  const fetchMangaList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/manga?status=${statusFilter}`);
      const data = await response.json();
      if (data.success) {
        setMangaList(data.manga);
      }
    } catch (error) {
      console.error('Failed to fetch manga list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags'),
      ]);

      const catData = await catRes.json();
      const tagData = await tagRes.json();

      if (catData.success) setAllCategories(catData.categories);
      if (tagData.success) setAllTags(tagData.tags);
    } catch (error) {
      console.error('Failed to fetch categories and tags:', error);
    }
  };

  // 过滤掉以当前漫画名作为的标签
  const getFilteredTags = (mangaTitle: string) => {
    return allTags.filter(tag => tag !== mangaTitle);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const url = isActive ? `/api/admin/manga/${id}/publish` : `/api/admin/manga/${id}`;

      const response = await fetch(url, {
        method: isActive ? 'POST' : 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchMangaList();
        alert(data.message);
      } else {
        alert('操作失败');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('操作失败');
    }
  };

  const openEditModal = (manga: Manga) => {
    setEditingManga(manga);
    setSelectedCategories(manga.categories || []);
    // 过滤掉以漫画名作为的标签
    const filteredTags = (manga.tags || []).filter(tag => tag !== manga.title);
    setSelectedTags(filteredTags);
  };

  const closeEditModal = () => {
    setEditingManga(null);
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const handleSaveEdit = async () => {
    if (!editingManga) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/manga/${editingManga.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: selectedCategories,
          tags: selectedTags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('保存成功！');
        closeEditModal();
        fetchMangaList();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('操作失败');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length >= 1) {
        alert('分类只能选择一个');
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredManga = mangaList.filter((manga) =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manga.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: mangaList.length,
    active: mangaList.filter((m) => m.isActive).length,
    inactive: mangaList.filter((m) => !m.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">漫画管理</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            管理所有漫画的上架、下架、分类和标签
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总漫画数</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已上架</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.active}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已下架</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.inactive}
              </p>
            </div>
            <div className="text-4xl">⛔</div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索漫画标题或作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              已上架
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'inactive'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              已下架
            </button>
          </div>
        </div>
      </div>

      {/* 漫画列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">加载中...</p>
          </div>
        </div>
      ) : filteredManga.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">暂无漫画数据</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    漫画
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    标签
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    数据
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredManga.map((manga) => (
                  <tr key={manga.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={manga.coverImage}
                          alt={manga.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {manga.title}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {manga.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {manga.categories.length > 0 ? (
                          manga.categories.map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-700"
                            >
                              {category}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">未分类</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const filteredTags = manga.tags.filter(tag => tag !== manga.title);
                          return filteredTags.length > 0 ? (
                            <>
                              {filteredTags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded border border-blue-200 dark:border-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                              {filteredTags.length > 3 && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  +{filteredTags.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">无标签</span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          manga.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {manga.isActive ? '已上架' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        <p>👁 {manga.views.toLocaleString()}</p>
                        <p>❤️ {manga.likes}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/manga/${manga.id}`}
                          target="_blank"
                          className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                        >
                          查看
                        </Link>
                        <button
                          onClick={() => openEditModal(manga)}
                          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleToggleStatus(manga.id, !manga.isActive)}
                          className={`px-3 py-1 text-sm rounded font-medium transition ${
                            manga.isActive
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                          }`}
                        >
                          {manga.isActive ? '下架' : '上架'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 编辑模态框 */}
      {editingManga && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                编辑漫画信息
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {editingManga.title}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 分类选择 */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  分类（单选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedCategories.includes(category)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:border-emerald-300 dark:hover:border-emerald-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标签选择 */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  标签（多选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {getFilteredTags(editingManga.title).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-lg border transition ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {getFilteredTags(editingManga.title).length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">暂无可用标签</p>
                  )}
                </div>
              </div>

              {/* 当前选择 */}
              <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  当前选择
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">分类：</span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">
                      {selectedCategories.length > 0 ? selectedCategories.join(', ') : '未选择'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">标签：</span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">
                      {selectedTags.length > 0 ? selectedTags.join(', ') : '未选择'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="px-6 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
