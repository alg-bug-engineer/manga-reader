interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface RateLimitConfig {
  maxRequests: number; // 最大请求次数
  windowMs: number; // 时间窗口(毫秒)
}

// 内存存储 (生产环境应该使用 Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期的条目
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 检查并更新访问频率限制
 * @param identifier 标识符(IP地址或用户ID)
 * @param config 配置
 * @returns { allowed: boolean; remaining: number; resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // 如果没有记录或已过期,创建新记录
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      lastRequest: now,
    };

    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // 检查是否超过限制
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 增加计数
  entry.count++;
  entry.lastRequest = now;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * 重置某个标识符的频率限制
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * 获取当前统计信息
 */
export function getRateLimitStats(identifier: string): { count: number; resetTime: number } | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return null;
  }

  return {
    count: entry.count,
    resetTime: entry.resetTime,
  };
}

// 图片访问的频率限制配置
export const IMAGE_RATE_LIMITS: RateLimitConfig = {
  maxRequests: 600, // 每分钟最多600次（10次/秒，足够支持页面加载）
  windowMs: 60000, // 1分钟
};

// 图片token生成的频率限制配置（单个token）
export const IMAGE_TOKEN_RATE_LIMITS: RateLimitConfig = {
  maxRequests: 300, // 每分钟最多300次（提高到5次/秒）
  windowMs: 60000, // 1分钟
};

// API访问的频率限制配置
export const API_RATE_LIMITS: RateLimitConfig = {
  maxRequests: 60, // 每分钟最多60次
  windowMs: 60000, // 1分钟
};

// 登录API的严格限制
export const LOGIN_RATE_LIMITS: RateLimitConfig = {
  maxRequests: 5, // 每分钟最多5次
  windowMs: 60000, // 1分钟
};
