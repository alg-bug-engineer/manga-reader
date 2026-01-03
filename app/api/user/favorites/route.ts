import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, getUserFavorites } from '@/lib/storage';
import { getAllMangaData } from '@/lib/scanner';

/**
 * GET /api/user/favorites
 * 获取当前用户的收藏列表
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const userId = getSessionUserId(sessionCookie.value);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '登录已过期' },
        { status: 401 }
      );
    }

    // 获取收藏的漫画ID列表
    const favoriteIds = getUserFavorites(userId);

    // 获取所有漫画并过滤出收藏的
    const allManga = getAllMangaData();
    const favorites = allManga.filter(manga => favoriteIds.includes(manga.id));

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
