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

    console.log('[Image Tokens Batch] Checking auth:', {
      hasSessionCookie: !!sessionCookie,
      sessionValue: sessionCookie ? sessionCookie.value.substring(0, 20) + '...' : 'none'
    });

    let userId: string | null = null;

    if (sessionCookie) {
      userId = getSessionUserId(sessionCookie.value);

      console.log('[Image Tokens Batch] Session validation:', {
        userId,
        hasUserId: !!userId
      });

      if (userId) {
        const user = findUserById(userId);
        if (!user) {
          console.warn('[Image Tokens Batch] User not found:', userId);
          userId = null; // 用户不存在，当作未登录处理
        } else {
          console.log('[Image Tokens Batch] User authenticated:', {
            userId,
            username: user.username
          });
        }
      }
    }

    // 未登录用户也可以获取 token（用于浏览主页）
    // 使用一个特殊的匿名用户ID
    if (!userId) {
      userId = 'anonymous';
      console.log('[Image Tokens Batch] Allowing anonymous access');
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

    // 添加调试日志
    console.log('[Image Tokens Batch] Request received:', {
      userId,
      pathsCount: imagePaths.length,
      firstPath: imagePaths[0]
    });

    // 生成所有token
    const tokens: Record<string, string> = {};

    for (const imagePath of imagePaths) {
      if (!imagePath || typeof imagePath !== 'string') {
        continue;
      }

      // 移除 /api/images/ 前缀（如果存在），确保使用相对路径
      let cleanImagePath = imagePath.replace(/^\/api\/images\//, '');

      // 规范化路径:移除首尾空格并标准化斜杠
      cleanImagePath = cleanImagePath.trim().split('/').map(segment => segment.trim()).join('/');

      // 安全检查:防止路径遍历
      if (cleanImagePath.includes('..')) {
        logSuspiciousActivity(
          request,
          'path_traversal_attempt',
          { imagePath: cleanImagePath },
          'critical',
          userId
        );
        console.warn('[Image Tokens Batch] Skipping path with ..:', cleanImagePath);
        continue;
      }

      // 生成图片访问令牌(5分钟有效期)
      const token = generateImageToken(userId, cleanImagePath, 5 * 60 * 1000);
      tokens[cleanImagePath] = token;
    }

    console.log('[Image Tokens Batch] Generated tokens:', {
      userId,
      count: Object.keys(tokens).length,
      sampleKeys: Object.keys(tokens).slice(0, 3)
    });

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
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5分钟缓存
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Batch generate image tokens error:', error);
    return NextResponse.json(
      { success: false, error: '批量生成令牌失败' },
      {
        status: 500,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}
