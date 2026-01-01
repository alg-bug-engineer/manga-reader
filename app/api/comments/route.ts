import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, findUserById } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json');

interface Comment {
  id: string;
  mangaId: string;
  chapterId?: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface CommentsData {
  [commentId: string]: Comment;
}

/**
 * 确保评论文件存在
 */
function ensureCommentsFile(): CommentsData {
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * 保存评论
 */
function saveComments(data: CommentsData) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * 获取评论列表
 * GET /api/comments?mangaId=xxx&chapterId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');
    const chapterId = searchParams.get('chapterId');

    if (!mangaId) {
      return NextResponse.json(
        { success: false, error: 'mangaId is required' },
        { status: 400 }
      );
    }

    const commentsData = ensureCommentsFile();
    const comments = Object.values(commentsData)
      .filter((c: any) => {
        const matchManga = c.mangaId === mangaId;
        const matchChapter = !chapterId || c.chapterId === chapterId;
        return matchManga && matchChapter;
      })
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

/**
 * 发表评论
 * POST /api/comments
 */
export async function POST(request: NextRequest) {
  try {
    const { mangaId, chapterId, content } = await request.json();

    // 从session获取用户
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

    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '评论内容不能为空' },
        { status: 400 }
      );
    }

    const commentsData = ensureCommentsFile();

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mangaId,
      chapterId,
      userId,
      username: user.username,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    commentsData[newComment.id] = newComment;
    saveComments(commentsData);

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Post comment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}
