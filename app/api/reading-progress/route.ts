import { NextRequest, NextResponse } from 'next/server';
import {
  getUserReadingProgress,
  getMangaReadingProgress,
  getRecentReads,
  updateReadingProgress,
} from '@/lib/storage';
import { getSessionUserId } from '@/lib/auth';

/**
 * GET /api/reading-progress
 * 获取阅读进度
 * 支持查询参数：
 * - mangaId: 获取特定漫画的阅读进度
 * - recent: 获取最近阅读的漫画列表
 */
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mangaId = searchParams.get('mangaId');
    const recent = searchParams.get('recent');
    const limit = searchParams.get('limit');

    if (mangaId) {
      // 获取特定漫画的阅读进度
      const progress = getMangaReadingProgress(userId, mangaId);
      return NextResponse.json({ progress });
    } else if (recent) {
      // 获取最近阅读的漫画列表
      const recentReads = getRecentReads(
        userId,
        limit ? parseInt(limit) : 10
      );
      return NextResponse.json({ recentReads });
    } else {
      // 获取所有阅读进度
      const allProgress = getUserReadingProgress(userId);
      // 按最后阅读时间倒序排序
      allProgress.sort(
        (a, b) =>
          new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
      );
      return NextResponse.json({ progressList: allProgress });
    }
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json(
      { error: '获取阅读进度失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reading-progress
 * 更新或创建阅读进度
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const {
      mangaId,
      mangaTitle,
      currentChapter,
      currentPage,
      totalPages,
      progressPercentage,
      isCompleted,
      readTime,
    } = body;

    // 验证必填字段
    if (!mangaId || !mangaTitle) {
      return NextResponse.json(
        { error: '漫画ID和标题不能为空' },
        { status: 400 }
      );
    }

    if (typeof currentChapter !== 'number' || typeof currentPage !== 'number') {
      return NextResponse.json(
        { error: '章节和页码必须为数字' },
        { status: 400 }
      );
    }

    // 更新阅读进度
    const progress = updateReadingProgress({
      userId,
      mangaId,
      mangaTitle,
      currentChapter,
      currentPage,
      totalPages: totalPages || 0,
      progressPercentage: progressPercentage || 0,
      isCompleted: isCompleted || false,
      readTime: readTime || 0,
    });

    return NextResponse.json({
      success: true,
      progress,
      message: '阅读进度已更新',
    });
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json(
      { error: '更新阅读进度失败' },
      { status: 500 }
    );
  }
}
