import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, findUserById, getUserMangaByUploader } from '@/lib/storage';

/**
 * GET /api/user/manga
 * 获取当前用户上传的漫画列表
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

    // 获取用户上传的漫画
    const userMangas = getUserMangaByUploader(userId);

    return NextResponse.json({
      success: true,
      mangas: userMangas,
      count: userMangas.length,
    });
  } catch (error) {
    console.error('Get user manga error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
