import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json');

interface Comment {
  id: string;
  likes: number;
}

/**
 * 点赞评论
 * POST /api/comments/[id]/like
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证用户登录
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
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 读取评论数据
    if (!fs.existsSync(COMMENTS_FILE)) {
      return NextResponse.json(
        { success: false, error: '评论不存在' },
        { status: 404 }
      );
    }

    const commentsData = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));

    if (!commentsData[id]) {
      return NextResponse.json(
        { success: false, error: '评论不存在' },
        { status: 404 }
      );
    }

    // 点赞数+1
    commentsData[id].likes = (commentsData[id].likes || 0) + 1;

    // 保存
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(commentsData, null, 2));

    return NextResponse.json({
      success: true,
      likes: commentsData[id].likes,
    });
  } catch (error) {
    console.error('Like comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like comment' },
      { status: 500 }
    );
  }
}
