'use client';

import { useState, useEffect } from 'react';
import { Manga, MangaListItem } from '@/types/manga';

/**
 * 自定义 Hook：加载本地漫画数据
 * 从 API 获取扫描的本地数据
 */
export function useLocalMangaData() {
  const [data, setData] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch('/api/manga/local', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch manga data');
        }

        const result = await response.json();
        setData(result.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading manga data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * 自定义 Hook：获取漫画列表
 */
export function useMangaList() {
  const { data, loading, error } = useLocalMangaData();
  const [mangaList, setMangaList] = useState<MangaListItem[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      const list = data.map((manga) => ({
        id: manga.id,
        title: manga.title,
        author: manga.author,
        coverImage: manga.coverImage,
        status: manga.status,
        categories: manga.categories,
        tags: manga.tags || [],
        latestChapter: manga.chapters[manga.chapters.length - 1]?.title || '暂无章节',
        updateTime: manga.updateTime,
        views: manga.views,
        likes: manga.likes || 0,
      }));
      setMangaList(list);
    }
  }, [data]);

  return { mangaList, loading, error, rawData: data };
}
