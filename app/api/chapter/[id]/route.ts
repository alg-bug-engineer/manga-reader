import { NextRequest, NextResponse } from 'next/server';
import { getAllMangaData } from '@/lib/scanner';

/**
 * API 路由：根据章节ID获取章节详情
 * GET /api/chapter/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取所有漫画数据
    const allManga = getAllMangaData();

    // 在所有漫画中查找匹配的章节
    for (const manga of allManga) {
      const chapter = manga.chapters.find(ch => ch.id === id);
      if (chapter) {
        return NextResponse.json({
          success: true,
          data: {
            ...chapter,
            manga: {
              id: manga.id,
              title: manga.title,
              author: manga.author,
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Chapter not found',
        id,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error getting chapter by ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get chapter data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
