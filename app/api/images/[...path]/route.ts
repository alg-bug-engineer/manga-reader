import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyImageToken } from '@/lib/security/crypto';
import { checkRateLimit, IMAGE_RATE_LIMITS } from '@/lib/security/rateLimiter';
import { getClientIp, logImageAccess, logSuspiciousActivity } from '@/lib/security/logger';
import { addTiledWatermark } from '@/lib/security/watermark';

/**
 * 获取允许的 Referer 列表
 */
function getAllowedReferers(): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const allowed = [baseUrl];
  if (siteUrl) {
    allowed.push(siteUrl);
  }

  return allowed;
}

/**
 * 检查 Referer 是否有效
 */
function isValidReferer(referer: string | null): boolean {
  // 如果没有 referer,允许访问（兼容某些隐私浏览器或代理）
  if (!referer) {
    return true;
  }

  const allowedReferers = getAllowedReferers();

  // 检查是否来自允许的域名
  for (const allowed of allowedReferers) {
    if (referer.startsWith(allowed)) {
      return true;
    }
  }

  // 生产环境:如果配置了允许列表但都不匹配，记录警告但仍然允许访问
  // 这样可以避免因Referer头部丢失导致的功能性问题
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  if (baseUrl !== 'http://localhost:3000') {
    // 生产环境但不匹配 - 记录警告但允许访问(容错性优先)
    console.warn(`[Security] Referer check failed: ${referer} not in allowed list. Allowing for compatibility.`);
    return true;
  }

  // 开发环境:默认允许
  return true;
}

/**
 * 获取图片并应用安全保护
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: imagePath } = await params;
  const clientIp = getClientIp(request);

  // 解码URL编码的路径（处理中文等特殊字符）
  const decodedPath = imagePath.map(segment => {
    const decoded = decodeURIComponent(segment);
    // 移除路径段首尾的空格（很多文件名可能有前导/尾随空格）
    return decoded.trim();
  });

  // 安全检查:防止路径遍历攻击
  if (decodedPath.some(segment => segment.includes('..'))) {
    logSuspiciousActivity(
      request,
      'path_traversal_attempt',
      { imagePath: decodedPath, originalPath: imagePath },
      'critical'
    );

    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // 构建完整的文件路径
  const fullPath = path.join(process.cwd(), 'data', ...decodedPath);

  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    logImageAccess(request, decodedPath.join('/'), false, undefined, 'file_not_found');
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // 检查是否为文件
  const stats = fs.statSync(fullPath);
  if (!stats.isFile()) {
    return NextResponse.json({ error: 'Not a file' }, { status: 400 });
  }

  // ========== 安全检查开始 ==========

  // 1. Referer 检查(防盗链)
  const referer = request.headers.get('referer');
  if (!isValidReferer(referer)) {
    logSuspiciousActivity(
      request,
      'invalid_referer',
      { referer, imagePath: decodedPath },
      'warning'
    );

    logImageAccess(request, decodedPath.join('/'), false, undefined, 'invalid_referer');

    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  // 2. Token 验证
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    logSuspiciousActivity(
      request,
      'missing_image_token',
      { imagePath: decodedPath },
      'warning'
    );

    logImageAccess(request, decodedPath.join('/'), false, undefined, 'missing_token');

    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }

  // 验证 Token (使用原始路径，因为token是基于原始路径生成的)
  // 注意:需要规范化路径格式,移除首尾空格
  const imageId = decodedPath.join('/');

  // 添加调试日志
  console.log('[Image API] Verifying token:', {
    imageId,
    decodedPath,
    tokenPresent: !!token,
    tokenPrefix: token.substring(0, 20) + '...'
  });

  const tokenValidation = verifyImageToken(token, imageId);

  if (!tokenValidation.valid) {
    console.log('[Image API] Token validation failed:', {
      imageId,
      reason: 'token_invalid_or_expired'
    });

    logSuspiciousActivity(
      request,
      'invalid_image_token',
      { imagePath: decodedPath, token: token.substring(0, 10) + '...', imageId },
      'warning'
    );

    logImageAccess(request, decodedPath.join('/'), false, undefined, 'invalid_token');

    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  console.log('[Image API] Token validated successfully:', {
    imageId,
    userId: tokenValidation.userId
  });

  // 3. 频率限制检查
  const rateLimitKey = `image:${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey, IMAGE_RATE_LIMITS);

  if (!rateLimit.allowed) {
    logSuspiciousActivity(
      request,
      'image_rate_limit_exceeded',
      { imagePath: decodedPath, resetTime: rateLimit.resetTime },
      'warning',
      tokenValidation.userId
    );

    logImageAccess(request, decodedPath.join('/'), false, tokenValidation.userId, 'rate_limited');

    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );
  }

  // ========== 安全检查通过,读取图片 ==========

  try {
    let fileBuffer = fs.readFileSync(fullPath);

    // 根据文件扩展名确定MIME类型
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 可选:添加水印(如果启用)
    const enableWatermark = process.env.ENABLE_WATERMARK === 'true';

    if (enableWatermark && tokenValidation.userId) {
      // 这里可以根据用户信息添加个性化水印
      // fileBuffer = await addUserWatermark(fileBuffer, username, Date.now());
      // 或者使用通用水印
      fileBuffer = Buffer.from(await addTiledWatermark(fileBuffer, 'Protected', 0.15));
    }

    // 记录成功访问
    logImageAccess(request, decodedPath.join('/'), true, tokenValidation.userId);

    // 返回图片
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, immutable', // 缓存5分钟(与token有效期一致)
        'X-Content-Type-Options': 'nosniff',
        // 添加安全头部
        'X-Frame-Options': 'DENY', // 防止在iframe中嵌入
        // 取消注释以禁用右键保存(浏览器支持有限)
        // 'Content-Disposition': 'inline; filename="image.jpg"',
      },
    });
  } catch (error) {
    console.error('Image read error:', error);

    logImageAccess(request, decodedPath.join('/'), false, tokenValidation.userId, 'read_error');

    return NextResponse.json(
      { error: 'Failed to read image' },
      { status: 500 }
    );
  }
}
