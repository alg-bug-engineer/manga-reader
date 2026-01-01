import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isFavorited, getSessionUserId, findUserById } from '@/lib/storage';

/**
 * 检查收藏状态
 * GET /api/favorites/check?mangaId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');

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
      return NextResponse.json({
        success: true,
        isFavorited: false,
      });
    }

    const userId = getSessionUserId(sessionCookie.value);

    if (!userId) {
      return NextResponse.json({
        success: true,
        isFavorited: false,
      });
    }

    const favorited = isFavorited(userId, mangaId);

    return NextResponse.json({
      success: true,
      isFavorited: favorited,
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    return NextResponse.json(
      { success: false, error: '检查失败' },
      { status: 500 }
    );
  }
}
