import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, getUserReadingProgress } from '@/lib/storage';

/**
 * GET /api/user/reading-progress
 * 获取当前用户的阅读进度
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

    // 获取阅读进度
    const progress = getUserReadingProgress(userId);

    return NextResponse.json({
      success: true,
      progress,
      count: progress.length,
    });
  } catch (error) {
    console.error('Get reading progress error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
