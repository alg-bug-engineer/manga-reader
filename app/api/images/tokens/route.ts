import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserId, findUserById } from '@/lib/storage';
import { generateImageToken } from '@/lib/security/crypto';
import { checkRateLimit, IMAGE_TOKEN_RATE_LIMITS } from '@/lib/security/rateLimiter';
import { getClientIp, logSecurity, logSuspiciousActivity } from '@/lib/security/logger';

/**
 * 批量生成图片访问令牌
 * POST /api/images/tokens
 * Body: { imagePaths: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 频率限制检查（批量请求使用更高的限制）
    const rateLimit = checkRateLimit(`image-token-batch:${clientIp}`, {
      maxRequests: 100, // 每分钟最多100次批量请求
      windowMs: 60000,
    });

    if (!rateLimit.allowed) {
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

    // 获取请求的图片路径列表
    const { imagePaths } = await request.json();

    if (!Array.isArray(imagePaths)) {
      return NextResponse.json(
        { success: false, error: '无效的图片路径列表' },
        { status: 400 }
      );
    }

    // 限制每次最多批量获取100个token
    if (imagePaths.length > 100) {
      return NextResponse.json(
        { success: false, error: '单次请求最多获取100个token' },
        { status: 400 }
      );
    }

    // 生成所有token
    const tokens: Record<string, string> = {};

    for (const imagePath of imagePaths) {
      if (!imagePath || typeof imagePath !== 'string') {
        continue;
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
        continue;
      }

      // 生成图片访问令牌(5分钟有效期)
      const token = generateImageToken(userId, cleanImagePath, 5 * 60 * 1000);
      tokens[cleanImagePath] = token;
    }

    // 记录令牌批量生成
    logSecurity({
      timestamp: Date.now(),
      level: 'info',
      type: 'image_tokens_batch_generated',
      ipAddress: clientIp,
      userId,
      details: { count: Object.keys(tokens).length },
    });

    return NextResponse.json({
      success: true,
      tokens,
      expiresIn: 300, // 5分钟(秒)
    });
  } catch (error) {
    console.error('Batch generate image tokens error:', error);
    return NextResponse.json(
      { success: false, error: '批量生成令牌失败' },
      { status: 500 }
    );
  }
}
