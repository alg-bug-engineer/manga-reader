import { NextRequest, NextResponse } from 'next/server';
import {
  addToBookshelf,
  removeFromBookshelf,
  updateBookshelfStatus,
  isInBookshelf,
} from '@/lib/storage';
import { getSessionUserId } from '@/lib/auth';

/**
 * POST /api/bookshelf/toggle
 * 添加到书架或从书架移除
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { mangaId, mangaTitle, mangaCover, author, action, status, note } = body;

    if (!mangaId) {
      return NextResponse.json(
        { error: '漫画ID不能为空' },
        { status: 400 }
      );
    }

    // 检查当前状态
    const inBookshelf = isInBookshelf(userId, mangaId);

    if (action === 'remove' || (action === 'toggle' && inBookshelf)) {
      // 从书架移除
      const success = removeFromBookshelf(userId, mangaId);
      if (!success) {
        return NextResponse.json(
          { error: '书架项不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        inBookshelf: false,
        message: '已从书架移除',
      });
    } else {
      // 添加到书架
      const bookshelfItem = addToBookshelf({
        userId,
        mangaId,
        mangaTitle: mangaTitle || 'Unknown',
        mangaCover: mangaCover || '',
        author: author || 'Unknown',
        status: status || 'reading',
        note,
      });

      return NextResponse.json({
        success: true,
        inBookshelf: true,
        item: bookshelfItem,
        message: '已添加到书架',
      });
    }
  } catch (error) {
    console.error('Error toggling bookshelf:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bookshelf/toggle
 * 更新书架项状态
 */
export async function PUT(request: NextRequest) {
  try {
    // 获取当前用户
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { mangaId, status, note } = body;

    if (!mangaId) {
      return NextResponse.json(
        { error: '漫画ID不能为空' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: '状态不能为空' },
        { status: 400 }
      );
    }

    // 更新书架项状态
    const updatedItem = updateBookshelfStatus(userId, mangaId, status, note);

    if (!updatedItem) {
      return NextResponse.json(
        { error: '书架项不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: '状态已更新',
    });
  } catch (error) {
    console.error('Error updating bookshelf status:', error);
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    );
  }
}
