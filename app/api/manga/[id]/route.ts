import { NextRequest, NextResponse } from 'next/server';
import { getAllMangaData } from '@/lib/scanner';

/**
 * API 路由：根据ID获取单个漫画详情
 * GET /api/manga/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取所有漫画数据
    const allManga = getAllMangaData();

    // 查找匹配的漫画
    const manga = allManga.find(m => m.id === id);

    if (!manga) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manga not found',
          id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: manga,
    });
  } catch (error) {
    console.error('Error getting manga by ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get manga data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
