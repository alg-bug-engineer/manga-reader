import { NextRequest, NextResponse } from 'next/server';

/**
 * 确认密码重置
 * POST /api/auth/reset-password/confirm
 * Body: { token: string, newPassword: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: '令牌和新密码不能为空' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 获取重置令牌存储
    const resetTokens = (global as any).passwordResetTokens;

    if (!resetTokens) {
      return NextResponse.json(
        { success: false, error: '重置链接无效或已过期' },
        { status: 400 }
      );
    }

    // 验证令牌
    const resetData = resetTokens.get(token);

    if (!resetData) {
      return NextResponse.json(
        { success: false, error: '重置链接无效或已过期' },
        { status: 400 }
      );
    }

    // 检查是否过期
    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(token);
      return NextResponse.json(
        { success: false, error: '重置链接已过期，请重新申请' },
        { status: 400 }
      );
    }

    // 获取用户
    const users = (global as any).users || [];
    const userIndex = users.findIndex((u: any) => u.id === resetData.userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 更新密码
    users[userIndex].password = newPassword;

    // 删除重置令牌
    resetTokens.delete(token);

    // 删除用户的所有会话（强制重新登录）
    const sessions = (global as any).userSessions;
    if (sessions) {
      for (const [sessionId, userId] of sessions.entries()) {
        if (userId === resetData.userId) {
          sessions.delete(sessionId);
        }
      }
    }

    console.log(`✓ 密码已重置: 用户ID ${resetData.userId}`);

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录',
    });
  } catch (error) {
    console.error('Confirm password reset error:', error);
    return NextResponse.json(
      { success: false, error: '重置失败，请重试' },
      { status: 500 }
    );
  }
}
