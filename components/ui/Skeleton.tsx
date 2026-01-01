import React from 'react';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// MangaCard 骨架屏
export function MangaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-stone-100">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 rounded" />

        {/* Author */}
        <Skeleton className="h-4 w-1/2 rounded" />

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>

        {/* Divider */}
        <div className="border-t border-stone-100 pt-3">
          <Skeleton className="h-4 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

// 漫画详情页骨架屏
export function MangaDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Cover */}
          <div className="md:w-80 flex-shrink-0">
            <div className="aspect-[3/4] md:aspect-auto md:h-full">
              <Skeleton className="h-full w-full" />
            </div>
          </div>

          {/* Info */}
          <div className="p-8 flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />

            <div className="flex flex-wrap gap-2 pt-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>

            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>

            <div className="flex gap-3 pt-6">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="mt-8">
        <Skeleton className="h-8 w-48 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
