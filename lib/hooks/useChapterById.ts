'use client';

import { useState, useEffect } from 'react';
import { Chapter } from '@/types/manga';

interface ChapterWithManga extends Chapter {
  manga: {
    id: string;
    title: string;
    author: string;
  };
}

/**
 * 根据章节ID获取章节详情
 */
export function useChapterById(chapterId: string) {
  const [chapter, setChapter] = useState<ChapterWithManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChapter() {
      try {
        setLoading(true);
        const response = await fetch(`/api/chapter/${chapterId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('章节不存在');
          } else {
            throw new Error('Failed to fetch chapter');
          }
          setChapter(null);
          return;
        }

        const result = await response.json();
        setChapter(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setChapter(null);
      } finally {
        setLoading(false);
      }
    }

    if (chapterId) {
      fetchChapter();
    }
  }, [chapterId]);

  return { chapter, loading, error };
}
