import { cookies } from 'next/headers';
import { getSessionUserId as getSessionUserIdFromStorage } from '@/lib/storage';
import type { NextRequest } from 'next/server';

/**
 * 从请求中获取当前用户ID
 * 如果用户未登录或session无效，返回null
 */
export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return null;
    }

    const userId = getSessionUserIdFromStorage(sessionCookie.value);
    return userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

