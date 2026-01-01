import ProtectedImage from './ProtectedImage';
import Link from 'next/link';
import { MangaListItem } from '@/types/manga';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import AuthModal from '../feedback/AuthModal';

interface MangaCardProps {
  manga: MangaListItem;
  index?: number;
  showLikeButton?: boolean; // 是否显示点赞按钮
}

export default function MangaCard({ manga, index = 0, showLikeButton = false }: MangaCardProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false); // 添加loading状态

  // 加载点赞状态
  useEffect(() => {
    async function loadLikeStatus() {
      try {
        const response = await fetch(`/api/manga/${manga.id}/like`);
        const data = await response.json();
        if (data.success) {
          setLiked(data.liked);
          setLikeCount(data.count);
        }
      } catch (error) {
        console.error('Failed to load like status:', error);
      }
    }

    loadLikeStatus();
  }, [manga.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // 防止重复点击
    if (isLiking) return;

    setIsLiking(true); // 开始loading

    try {
      const response = await fetch(`/api/manga/${manga.id}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.count);
        toast.success(data.liked ? '已点赞' : '已取消点赞', 2000);
      } else {
        toast.error(data.error || '操作失败', 2000);
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      toast.error('操作失败', 2000);
    } finally {
      setIsLiking(false); // 结束loading
    }
  };
  // 调试：输出图片URL
  useEffect(() => {
    console.log(`[MangaCard ${index}] Title: ${manga.title}`);
    console.log(`[MangaCard ${index}] CoverImage: ${manga.coverImage}`);
    console.log(`[MangaCard ${index}] CoverImage type: ${typeof manga.coverImage}`);
  }, [manga, index]);
  const statusText = {
    ongoing: '连载中',
    completed: '已完结',
    hiatus: '暂停',
  };

  const statusColor = {
    ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-stone-50 text-stone-700 border-stone-200',
    hiatus: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <Link href={`/manga/${manga.id}`} className="group block h-full">
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden
                     hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200
                     animate-fade-in h-full flex flex-col"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <img
            src={manga.coverImage}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {/* Status Badge - 结构线风格 */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium
                           backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 border ${statusColor[manga.status]}`}>
            {statusText[manga.status]}
          </div>

          {/* Hover Overlay - 更简洁 */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/0 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="absolute bottom-3 left-3 right-3">
              <div className="text-white text-sm font-medium flex items-center gap-2">
                <span>立即阅读</span>
                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-1.5 line-clamp-1
                       group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-display">
            {manga.title}
          </h3>

          {/* Author */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            {manga.author}
          </p>

          {/* Categories & Tags - 结构线风格 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {/* 显示分类（最多3个） */}
            {manga.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs bg-emerald-50 dark:bg-emerald-900/30
                             text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700
                             font-medium leading-tight whitespace-nowrap"
              >
                {category}
              </span>
            ))}
            {/* 显示标签（最多2个，排除已在分类中的） */}
            {manga.tags && manga.tags
              .filter(tag => !manga.categories.includes(tag))
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-zinc-50 dark:bg-zinc-700
                               text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-600
                               font-medium leading-tight whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Divider - 更细 */}
          <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3 mt-auto">
            {/* Latest Chapter & Views & Likes */}
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 truncate flex-1">
                {manga.latestChapter}
              </span>
              <div className="flex items-center gap-3">
                {showLikeButton && (
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-1 transition-transform ${
                      isLiking
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-110'
                    }`}
                    title={liked ? '取消点赞' : '点赞'}
                  >
                    {isLiking ? (
                      // Loading 状态
                      <>
                        <svg className="w-4 h-4 animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-zinc-400 font-medium">...</span>
                      </>
                    ) : (
                      // 正常状态
                      <>
                        <span className={liked ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-600'}>
                          {liked ? '❤️' : '🤍'}
                        </span>
                        <span className={liked ? 'text-red-500 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                          {likeCount}
                        </span>
                      </>
                    )}
                  </button>
                )}
                <span className="text-zinc-400 dark:text-zinc-600 flex items-center gap-1 whitespace-nowrap">
                  <span>👁</span>
                  <span>{manga.views.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
        />
      )}
    </Link>
  );
}
