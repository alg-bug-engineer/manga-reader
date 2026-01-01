export default function MangaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden
                  border border-zinc-200
                  animate-pulse">
      {/* 封面占位 */}
      <div className="aspect-[3/4] bg-zinc-100">
        <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
      </div>

      {/* 内容占位 */}
      <div className="p-4 space-y-3">
        {/* 标题 */}
        <div className="h-5 bg-zinc-100 rounded w-3/4 animate-pulse" />

        {/* 作者 */}
        <div className="h-4 bg-zinc-100 rounded w-1/2 animate-pulse" />

        {/* 标签 */}
        <div className="flex gap-2">
          <div className="h-6 bg-zinc-100 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-zinc-100 rounded-full w-12 animate-pulse" />
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-zinc-100" />

        {/* 统计信息 */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-zinc-100 rounded w-20 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-4 bg-zinc-100 rounded w-8 animate-pulse" />
            <div className="h-4 bg-zinc-100 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
