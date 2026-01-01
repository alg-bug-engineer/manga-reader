import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT 密钥 - 生产环境应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWT Payload 接口
 */
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 生成图片访问令牌
 */
export function generateImageToken(userId: string, imageId: string, expiresIn: number = 300000): string {
  // 默认5分钟有效期
  const payload = {
    userId,
    imageId,
    timestamp: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${expiresIn}ms` });
}

/**
 * 验证图片访问令牌
 */
export interface ImageTokenPayload {
  userId: string;
  imageId: string;
  timestamp: number;
}

export function verifyImageToken(token: string, imageId: string): { valid: boolean; userId?: string } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as ImageTokenPayload;

    // 验证图片ID是否匹配
    if (payload.imageId !== imageId) {
      return { valid: false };
    }

    return { valid: true, userId: payload.userId };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * 从请求头中提取并验证 Token
 */
export function extractAndVerifyToken(authorizationHeader: string | null): JWTPayload | null {
  if (!authorizationHeader) {
    return null;
  }

  // 支持 "Bearer <token>" 格式
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const token = parts[1];
  return verifyToken(token);
}
