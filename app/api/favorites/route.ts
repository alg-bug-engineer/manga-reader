import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFavorites, getSessionUserId } from '@/lib/storage';

/**
 * 获取用户的收藏列表
 * GET /api/favorites
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const userId = getSessionUserId(sessionCookie.value);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const favorites = getUserFavorites(userId);

    return NextResponse.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: '获取收藏列表失败' },
      { status: 500 }
    );
  }
}
