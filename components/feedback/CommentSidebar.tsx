'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import AuthModal from './AuthModal';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface CommentSidebarProps {
  mangaId: string;
  chapterId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSidebar({ mangaId, chapterId, isOpen, onClose }: CommentSidebarProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 加载评论
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, mangaId, chapterId]);

  const loadComments = async () => {
    try {
      const url = chapterId
        ? `/api/comments?mangaId=${mangaId}&chapterId=${chapterId}`
        : `/api/comments?mangaId=${mangaId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaId,
          chapterId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment('');
        loadComments(); // 重新加载评论
        toast.success('评论发表成功！');
      } else {
        toast.error(data.error || '发表失败');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('发表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      loadComments(); // 重新加载评论
      toast.success('点赞成功！');
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error('点赞失败');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* 侧边栏 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 font-display">
              💬 评论 ({comments.length})
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* 评论列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-stone-500">还没有评论，快来抢沙发吧！</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-stone-50 rounded-xl p-4 border border-stone-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-stone-900 text-sm">
                          {comment.username}
                        </div>
                        <div className="text-xs text-stone-500">
                          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1 text-sm text-stone-500 hover:text-violet-600 transition"
                    >
                      <span>👍</span>
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 输入框 */}
          <div className="p-6 border-t border-stone-200 bg-stone-50">
            {!user && (
              <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-lg text-center">
                <p className="text-violet-700 text-sm mb-2">登录后可以发表评论</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-violet-600 hover:text-violet-700 font-medium text-sm underline"
                >
                  前往登录 →
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "说点什么..." : "请先登录"}
                disabled={!user || loading}
                className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none disabled:bg-stone-100 disabled:cursor-not-allowed transition"
                rows={3}
              />
              <button
                onClick={handleSubmit}
                disabled={!user || !newComment.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </>
  );
}
