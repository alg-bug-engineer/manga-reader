import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, findUserById } from '@/lib/storage';

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    const sessionId = sessionCookie.value;

    // 从session存储中获取用户ID
    const userId = getSessionUserId(sessionId);

    if (!userId) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    // 查找用户
    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: true,
      user: null,
    });
  }
}
