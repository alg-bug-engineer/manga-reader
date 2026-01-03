import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, getUserBookshelf } from '@/lib/storage';

/**
 * GET /api/user/bookshelf
 * 获取当前用户的书架
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

    // 获取书架
    const bookshelf = getUserBookshelf(userId);

    return NextResponse.json({
      success: true,
      bookshelf,
      count: bookshelf.length,
    });
  } catch (error) {
    console.error('Get bookshelf error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
