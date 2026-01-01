import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { toggleMangaLike, getSessionUserId } from '@/lib/storage';

/**
 * 切换漫画点赞状态
 * POST /api/manga/[id]/like
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从session获取用户ID
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
        { success: false, error: '登录已过期，请重新登录' },
        { status: 401 }
      );
    }

    const result = toggleMangaLike(userId, id);

    return NextResponse.json({
      success: true,
      liked: result.liked,
      count: result.count,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取漫画点赞状态和数量
 * GET /api/manga/[id]/like
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从session获取用户ID（如果已登录）
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    let liked = false;
    if (sessionCookie) {
      const userId = getSessionUserId(sessionCookie.value);
      if (userId) {
        const { hasUserLiked } = await import('@/lib/storage');
        liked = hasUserLiked(userId, id);
      }
    }

    // 获取点赞数
    const { getMangaLikes } = await import('@/lib/storage');
    const count = getMangaLikes(id);

    return NextResponse.json({
      success: true,
      liked,
      count,
    });
  } catch (error) {
    console.error('Get like status error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
