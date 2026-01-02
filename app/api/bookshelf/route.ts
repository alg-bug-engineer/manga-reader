import { NextRequest, NextResponse } from 'next/server';
import { getUserBookshelf, isInBookshelf, getBookshelfStats } from '@/lib/storage';
import { getSessionUserId } from '@/lib/auth';

/**
 * GET /api/bookshelf
 * 获取当前用户的书架
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // reading, completed, planned, dropped

    // 获取书架数据
    let bookshelf = getUserBookshelf(userId);

    // 按状态过滤
    if (status) {
      bookshelf = bookshelf.filter(item => item.status === status);
    }

    // 按更新时间倒序排序
    bookshelf.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // 获取统计信息
    const stats = getBookshelfStats(userId);

    return NextResponse.json({
      bookshelf,
      stats,
    });
  } catch (error) {
    console.error('Error fetching bookshelf:', error);
    return NextResponse.json(
      { error: '获取书架失败' },
      { status: 500 }
    );
  }
}
