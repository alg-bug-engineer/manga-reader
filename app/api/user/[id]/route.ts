import { NextRequest, NextResponse } from 'next/server';
import { findUserById, getUserFavorites } from '@/lib/storage';
import { getAllMangaData } from '@/lib/scanner';

/**
 * 获取用户个人信息
 * GET /api/user/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取用户信息
    const user = findUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取收藏列表
    const favoriteIds = getUserFavorites(id);

    // 获取所有漫画数据
    const allManga = getAllMangaData();

    // 筛选出收藏的漫画
    const favoriteManga = allManga.filter(manga => favoriteIds.includes(manga.id));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      favorites: favoriteManga,
      favoriteCount: favoriteIds.length,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
