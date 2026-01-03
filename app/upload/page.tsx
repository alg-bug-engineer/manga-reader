'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [] as string[],
    tags: [] as string[],
    coverImage: '',
    chapters: [] as Array<{
      id: string;
      title: string;
      pages: string[];
    }>,
  });

  const [currentChapter, setCurrentChapter] = useState({
    title: '',
    pages: [] as File[],
  });

  // AI 分类选项
  const aiCategories = [
    '大模型',
    'NLP',
    '计算机视觉',
    '机器学习',
    '深度学习',
    '强化学习',
    '知识图谱',
    'AI伦理',
  ];

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: 实际上传到服务器
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCurrentChapter({
      ...currentChapter,
      pages: [...currentChapter.pages, ...files],
    });
  };

  const handleAddChapter = () => {
    if (!currentChapter.title || currentChapter.pages.length === 0) {
      toast.error('请填写章节标题并上传页面图片', 2000);
      return;
    }

    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: currentChapter.title,
      pages: currentChapter.pages.map((file, index) =>
        URL.createObjectURL(file)
      ),
    };

    setFormData({
      ...formData,
      chapters: [...formData.chapters, newChapter],
    });

    setCurrentChapter({ title: '', pages: [] });
    toast.success('章节添加成功', 2000);
  };

  const handleRemoveChapter = (chapterId: string) => {
    setFormData({
      ...formData,
      chapters: formData.chapters.filter(c => c.id !== chapterId),
    });
  };

  const handleCategoryToggle = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter(c => c !== category)
        : [...formData.categories, category],
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.coverImage) {
      toast.error('请填写完整信息', 2000);
      return;
    }

    if (formData.chapters.length === 0) {
      toast.error('请至少添加一个章节', 2000);
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('/api/user/manga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          chapters: formData.chapters.map(ch => ({
            ...ch,
            pages: [], // TODO: 实际上传后填充路径
            createdAt: new Date().toISOString(),
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('上传成功，等待审核', 2000);
        setTimeout(() => {
          router.push('/profile');
        }, 1000);
      } else {
        toast.error(data.error || '上传失败', 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传失败', 2000);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">请先登录</p>
            <Link
              href="/login"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              前往登录
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          {/* 页头 */}
          <div className="mb-8">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回个人中心
            </Link>
            <h1 className="text-3xl font-semibold text-gray-900">上传漫画</h1>
            <p className="text-gray-600 mt-2">创作并分享你的AI知识漫画</p>
          </div>

          {/* 步骤指示 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {s}
                    </div>
                    <span className={`ml-2 text-sm ${
                      step >= s ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {s === 1 ? '基本信息' : s === 2 ? '上传封面' : '添加章节'}
                    </span>
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step > s ? 'bg-gray-900' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 表单内容 */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {/* 步骤 1: 基本信息 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    漫画标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例如：Transformer 架构详解"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    漫画描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="简要描述漫画内容和知识点..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aiCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.categories.includes(category)
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.description || formData.categories.length === 0}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 2: 上传封面 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    封面图片 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
                    {formData.coverImage ? (
                      <div className="space-y-4">
                        <img
                          src={formData.coverImage}
                          alt="封面预览"
                          className="max-h-64 mx-auto rounded"
                        />
                        <button
                          onClick={() => setFormData({ ...formData, coverImage: '' })}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          重新上传
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="cursor-pointer inline-block"
                        >
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">点击或拖拽上传封面</p>
                          <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG，最大 2MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    上一步
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.coverImage}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {/* 步骤 3: 添加章节 */}
            {step === 3 && (
              <div className="space-y-6">
                {/* 已添加章节列表 */}
                {formData.chapters.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      已添加章节 ({formData.chapters.length})
                    </label>
                    <div className="space-y-2">
                      {formData.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{chapter.title}</p>
                            <p className="text-sm text-gray-600">{chapter.pages.length} 页</p>
                          </div>
                          <button
                            onClick={() => handleRemoveChapter(chapter.id)}
                            className="text-sm text-gray-600 hover:text-red-600 transition"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 添加新章节 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">添加新章节</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        章节标题
                      </label>
                      <input
                        type="text"
                        value={currentChapter.title}
                        onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
                        placeholder="例如：第1章 什么是机器学习"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        上传页面图片
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePageUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        已选择 {currentChapter.pages.length} 个文件
                      </p>
                    </div>

                    <button
                      onClick={handleAddChapter}
                      disabled={!currentChapter.title || currentChapter.pages.length === 0}
                      className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      添加章节
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    上一步
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || formData.chapters.length === 0}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? '上传中...' : '提交审核'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
