import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/storage';

/**
 * 用户登出
 * POST /api/auth/logout
 */
export async function POST() {
  const cookieStore = await cookies();

  // 获取当前session
  const sessionCookie = cookieStore.get('session');

  // 删除session数据
  if (sessionCookie) {
    deleteSession(sessionCookie.value);
  }

  // 清除session cookie
  cookieStore.delete('session');

  return NextResponse.json({
    success: true,
    message: '已成功登出',
  });
}
