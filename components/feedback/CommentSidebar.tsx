'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';

interface Comment {
  id: string;
  mangaId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface CommentSidebarProps {
  mangaId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSidebar({ mangaId, isOpen, onClose }: CommentSidebarProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 加载评论
  useEffect(() => {
    if (isOpen && mangaId) {
      loadComments();
    }
  }, [isOpen, mangaId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?mangaId=${mangaId}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('请先登录', 2000);
      return;
    }

    if (!newComment.trim()) {
      toast.error('评论内容不能为空', 2000);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaId,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('评论发表成功', 2000);
        setNewComment('');
        loadComments(); // 重新加载评论
      } else {
        toast.error(data.error || '发表失败', 2000);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('发表失败', 2000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-zinc-800 shadow-2xl z-50 transform transition-transform">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white font-display">
            评论区 ({comments.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] flex flex-col">
          {/* 评论列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                <p className="text-lg mb-2">还没有评论</p>
                <p className="text-sm">快来发表第一条评论吧！</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  {/* 用户信息 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {comment.username}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>

                  {/* 评论内容 */}
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* 点赞数 */}
                  <div className="mt-3 flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <span>❤️</span>
                    <span>{comment.likes}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 输入框 */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900">
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? '发表你的看法...' : '请先登录后发表评论'}
                disabled={!user || submitting}
                rows={3}
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!user || submitting || !newComment.trim()}
                  className="px-6 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>发表中...</span>
                    </>
                  ) : (
                    <span>发表评论</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
