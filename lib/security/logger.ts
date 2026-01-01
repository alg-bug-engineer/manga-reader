import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCESS_LOG_FILE = path.join(DATA_DIR, 'access-logs.jsonl');
const SECURITY_LOG_FILE = path.join(DATA_DIR, 'security-logs.jsonl');

interface AccessLogEntry {
  timestamp: number;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  imagePath: string;
  referer?: string;
  success: boolean;
  reason?: string;
}

interface SecurityLogEntry {
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  type: string;
  userId?: string;
  ipAddress: string;
  details: Record<string, any>;
}

/**
 * 确保日志目录存在
 */
function ensureLogDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 写入访问日志
 */
export function logAccess(entry: AccessLogEntry): void {
  try {
    ensureLogDir();
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(ACCESS_LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write access log:', error);
  }
}

/**
 * 写入安全日志
 */
export function logSecurity(entry: SecurityLogEntry): void {
  try {
    ensureLogDir();
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(SECURITY_LOG_FILE, logLine);

    // 对于严重的安全事件,同时输出到控制台
    if (entry.level === 'critical' || entry.level === 'error') {
      console.error('[SECURITY]', JSON.stringify(entry));
    }
  } catch (error) {
    console.error('Failed to write security log:', error);
  }
}

/**
 * 获取客户端IP地址
 */
export function getClientIp(request: Request): string {
  // 检查各种可能的头部
  const headers = request.headers;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // 取第一个IP
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 默认返回未知
  return 'unknown';
}

/**
 * 记录图片访问
 */
export function logImageAccess(
  request: Request,
  imagePath: string,
  success: boolean,
  userId?: string,
  reason?: string
): void {
  const entry: AccessLogEntry = {
    timestamp: Date.now(),
    userId,
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    imagePath,
    referer: request.headers.get('referer') || undefined,
    success,
    reason,
  };

  logAccess(entry);
}

/**
 * 记录可疑行为
 */
export function logSuspiciousActivity(
  request: Request,
  activityType: string,
  details: Record<string, any>,
  level: 'warning' | 'error' | 'critical' = 'warning',
  userId?: string
): void {
  const entry: SecurityLogEntry = {
    timestamp: Date.now(),
    level,
    type: activityType,
    userId,
    ipAddress: getClientIp(request),
    details,
  };

  logSecurity(entry);
}

/**
 * 日志轮转 - 防止日志文件过大
 */
export function rotateLogsIfNeeded(maxFileSize: number = 10 * 1024 * 1024): void {
  try {
    ensureLogDir();

    const files = [
      { path: ACCESS_LOG_FILE, name: 'access' },
      { path: SECURITY_LOG_FILE, name: 'security' },
    ];

    for (const file of files) {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);

        if (stats.size > maxFileSize) {
          // 轮转日志
          const timestamp = Date.now();
          const rotatedPath = path.join(DATA_DIR, `${file.name}-log-${timestamp}.jsonl`);
          fs.renameSync(file.path, rotatedPath);

          // 保留最近7天的日志
          const logFiles = fs.readdirSync(DATA_DIR)
            .filter(f => f.startsWith(`${file.name}-log-`) && f.endsWith('.jsonl'))
            .map(f => ({
              path: path.join(DATA_DIR, f),
              time: parseInt(f.match(/(\d+)/)?.[0] || '0'),
            }))
            .sort((a, b) => b.time - a.time);

          // 删除7天前的日志
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          for (const logFile of logFiles) {
            if (logFile.time < sevenDaysAgo) {
              fs.unlinkSync(logFile.path);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to rotate logs:', error);
  }
}

// 每天检查一次日志轮转
setInterval(() => {
  rotateLogsIfNeeded();
}, 24 * 60 * 60 * 1000);
