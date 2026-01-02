import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, findUserById } from '@/lib/storage';
import { generateImageToken } from '@/lib/security/crypto';
import { checkRateLimit, IMAGE_TOKEN_RATE_LIMITS } from '@/lib/security/rateLimiter';
import { getClientIp, logSecurity, logSuspiciousActivity } from '@/lib/security/logger';

/**
 * 生成图片访问令牌
 * POST /api/images/token
 * Body: { imagePath: string }
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 频率限制检查
    const rateLimit = checkRateLimit(`image-token:${clientIp}`, IMAGE_TOKEN_RATE_LIMITS);
    if (!rateLimit.allowed) {
      logSuspiciousActivity(
        request,
        'image_token_rate_limit',
        { attempts: rateLimit.remaining },
        'warning'
      );

      return NextResponse.json(
        {
          success: false,
          error: '请求过于频繁,请稍后再试',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // 验证用户登录状态
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      logSuspiciousActivity(request, 'image_token_no_session', {}, 'warning');

      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const userId = getSessionUserId(sessionCookie.value);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '登录已过期,请重新登录' },
        { status: 401 }
      );
    }

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 401 }
      );
    }

    // 获取请求的图片路径
    const { imagePath } = await request.json();

    if (!imagePath || typeof imagePath !== 'string') {
      return NextResponse.json(
        { success: false, error: '无效的图片路径' },
        { status: 400 }
      );
    }

    // 移除 /api/images/ 前缀（如果存在），确保使用相对路径
    const cleanImagePath = imagePath.replace(/^\/api\/images\//, '');

    // 安全检查:防止路径遍历
    if (cleanImagePath.includes('..')) {
      logSuspiciousActivity(
        request,
        'path_traversal_attempt',
        { imagePath: cleanImagePath },
        'critical',
        userId
      );

      return NextResponse.json(
        { success: false, error: '非法的图片路径' },
        { status: 400 }
      );
    }

    // 生成图片访问令牌(5分钟有效期)
    const token = generateImageToken(userId, cleanImagePath, 5 * 60 * 1000);

    // 记录令牌生成
    logSecurity({
      timestamp: Date.now(),
      level: 'info',
      type: 'image_token_generated',
      ipAddress: clientIp,
      userId,
      details: { imagePath },
    });

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 300, // 5分钟(秒)
    });
  } catch (error) {
    console.error('Generate image token error:', error);
    return NextResponse.json(
      { success: false, error: '生成令牌失败' },
      { status: 500 }
    );
  }
}
