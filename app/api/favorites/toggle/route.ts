import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { toggleFavorite, getSessionUserId } from '@/lib/storage';

/**
 * 切换收藏状态
 * POST /api/favorites/toggle
 */
export async function POST(request: NextRequest) {
  try {
    const { mangaId } = await request.json();

    if (!mangaId) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 }
      );
    }

    // 从session获取用户ID
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

    const result = toggleFavorite(userId, mangaId);

    return NextResponse.json({
      success: true,
      isFavorited: result.isFavorited,
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}
