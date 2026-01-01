import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * 请求密码重置
 * POST /api/auth/reset-password/request
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    // 初始化全局存储
    if (!(global as any).passwordResetTokens) {
      (global as any).passwordResetTokens = new Map();
    }

    // 查找用户
    const users = (global as any).users || [];
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      // 为了安全，即使用户不存在也返回成功（防止邮箱枚举）
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，您将收到重置链接'
      });
    }

    // 生成重置令牌（有效期1小时）
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1小时后过期

    // 存储令牌
    (global as any).passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt,
    });

    // 在实际项目中，这里应该发送邮件
    // 由于我们没有邮件服务，将令牌输出到控制台供测试使用
    console.log('═══════════════════════════════════════════════════════');
    console.log('密码重置令牌（测试用）');
    console.log('邮箱:', email);
    console.log('令牌:', resetToken);
    console.log('有效期: 1小时');
    console.log('═══════════════════════════════════════════════════════');

    return NextResponse.json({
      success: true,
      message: '重置链接已生成（测试环境请查看控制台）',
      // 仅在开发环境返回令牌
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json(
      { success: false, error: '请求失败，请重试' },
      { status: 500 }
    );
  }
}
