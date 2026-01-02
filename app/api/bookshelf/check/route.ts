import { NextRequest, NextResponse } from 'next/server';
import { isInBookshelf } from '@/lib/storage';
import { getSessionUserId } from '@/lib/auth';

/**
 * GET /api/bookshelf/check?mangaId=xxx
 * 检查漫画是否在用户书架中
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取漫画ID
    const searchParams = request.nextUrl.searchParams;
    const mangaId = searchParams.get('mangaId');

    if (!mangaId) {
      return NextResponse.json(
        { error: '漫画ID不能为空' },
        { status: 400 }
      );
    }

    // 检查是否在书架中
    const inBookshelf = isInBookshelf(userId, mangaId);

    return NextResponse.json({
      inBookshelf,
      mangaId,
    });
  } catch (error) {
    console.error('Error checking bookshelf status:', error);
    return NextResponse.json(
      { error: '检查失败' },
      { status: 500 }
    );
  }
}
