import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addUser, findUserByEmail, createSession, type User } from '@/lib/storage';
import { hashPassword, generateToken } from '@/lib/security/crypto';
import { checkRateLimit, LOGIN_RATE_LIMITS } from '@/lib/security/rateLimiter';
import { getClientIp, logSecurity } from '@/lib/security/logger';

// 生成简单的sessionId
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 用户注册
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 频率限制检查
    const rateLimit = checkRateLimit(`register:${clientIp}`, LOGIN_RATE_LIMITS);
    if (!rateLimit.allowed) {
      logSecurity({
        timestamp: Date.now(),
        level: 'warning',
        type: 'rate_limit_exceeded',
        ipAddress: clientIp,
        details: { endpoint: 'register' },
      });

      return NextResponse.json(
        { success: false, error: '请求过于频繁,请稍后再试' },
        { status: 429 }
      );
    }

    const { email, username, password } = await request.json();

    // 验证输入
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: '请填写所有字段' },
        { status: 400 }
      );
    }

    // 密码强度验证
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const added = addUser(newUser);
    if (!added) {
      return NextResponse.json(
        { success: false, error: '注册失败,请稍后重试' },
        { status: 500 }
      );
    }

    // 创建session
    const sessionId = generateSessionId();
    createSession(newUser.id, sessionId);

    // 生成JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
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

    // 记录成功注册
    logSecurity({
      timestamp: Date.now(),
      level: 'info',
      type: 'user_registered',
      ipAddress: clientIp,
      details: { userId: newUser.id, email },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: '注册失败' },
      { status: 500 }
    );
  }
}
