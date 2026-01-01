'use client';

import { useState, useEffect } from 'react';
import { Manga } from '@/types/manga';

/**
 * 根据ID获取漫画详情
 */
export function useMangaById(id: string) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchManga() {
      try {
        setLoading(true);
        const response = await fetch(`/api/manga/${id}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('漫画不存在');
          } else {
            throw new Error('Failed to fetch manga');
          }
          setManga(null);
          return;
        }

        const result = await response.json();
        setManga(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching manga:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setManga(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchManga();
    }
  }, [id]);

  return { manga, loading, error };
}
