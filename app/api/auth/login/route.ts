import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByEmail, createSession, type User } from '@/lib/storage';
import { verifyPassword, generateToken } from '@/lib/security/crypto';
import { checkRateLimit, LOGIN_RATE_LIMITS } from '@/lib/security/rateLimiter';
import { getClientIp, logSecurity } from '@/lib/security/logger';

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 频率限制检查
    const rateLimit = checkRateLimit(`login:${clientIp}`, LOGIN_RATE_LIMITS);
    if (!rateLimit.allowed) {
      logSecurity({
        timestamp: Date.now(),
        level: 'warning',
        type: 'rate_limit_exceeded',
        ipAddress: clientIp,
        details: { endpoint: 'login' },
      });

      return NextResponse.json(
        { success: false, error: '请求过于频繁,请稍后再试' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请填写邮箱和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = findUserByEmail(email);
    if (!user) {
      // 记录失败的登录尝试
      logSecurity({
        timestamp: Date.now(),
        level: 'warning',
        type: 'login_failed',
        ipAddress: clientIp,
        details: { email, reason: 'user_not_found' },
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      // 记录失败的登录尝试
      logSecurity({
        timestamp: Date.now(),
        level: 'warning',
        type: 'login_failed',
        ipAddress: clientIp,
        userId: user.id,
        details: { email, reason: 'invalid_password' },
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 创建session
    const sessionId = generateSessionId();
    createSession(user.id, sessionId);

    // 生成JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // 设置cookie使用 Next.js cookies API
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    // 记录成功登录
    logSecurity({
      timestamp: Date.now(),
      level: 'info',
      type: 'user_logged_in',
      ipAddress: clientIp,
      userId: user.id,
      details: { email },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败' },
      { status: 500 }
    );
  }
}
