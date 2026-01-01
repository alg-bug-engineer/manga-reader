/**
 * 日志工具
 * 用于记录 API 请求、响应和错误信息
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  debug(message: string, data?: any) {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: any) {
    if (this.logLevel <= LogLevel.ERROR) {
      const errorData = error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error;
      console.error(this.formatMessage('ERROR', message, errorData));
    }
  }

  // API 专用日志方法
  apiRequest(endpoint: string, data: {
    method: string;
    headers?: Record<string, string>;
    body?: any;
  }) {
    this.info('API Request', {
      endpoint,
      method: data.method,
      headers: this.sanitizeHeaders(data.headers),
      hasBody: !!data.body,
      bodySize: data.body ? JSON.stringify(data.body).length : 0,
    });
  }

  apiResponse(endpoint: string, data: {
    status: number;
    statusText: string;
    duration: number;
    headers?: Record<string, string>;
  }) {
    this.info('API Response', {
      endpoint,
      status: data.status,
      statusText: data.statusText,
      duration: `${data.duration}ms`,
      headers: data.headers,
    });
  }

  apiError(endpoint: string, error: any) {
    this.error('API Error', {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 脚本生成专用日志
  scriptGenerationStart(concept: string, style: string) {
    this.info('Script Generation Started', {
      concept,
      style,
      timestamp: new Date().toISOString(),
    });
  }

  scriptGenerationSuccess(panelsCount: number, duration: number) {
    this.info('Script Generation Success', {
      panelsCount,
      duration: `${duration}ms`,
      avgTimePerPanel: `${Math.round(duration / panelsCount)}ms`,
    });
  }

  scriptGenerationFailure(error: any, duration: number) {
    this.error('Script Generation Failed', {
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    });
  }

  // 图片生成专用日志
  imageGenerationStart(panelNumber: number, style: string) {
    this.info('Image Generation Started', {
      panelNumber,
      style,
      timestamp: new Date().toISOString(),
    });
  }

  imageGenerationSuccess(panelNumber: number, duration: number, imageSize: number) {
    this.info('Image Generation Success', {
      panelNumber,
      duration: `${duration}ms`,
      imageSize: `${Math.round(imageSize / 1024)}KB`,
    });
  }

  imageGenerationFailure(panelNumber: number, error: any, duration: number) {
    this.error('Image Generation Failed', {
      panelNumber,
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    });
  }

  // 批量生成进度日志
  batchProgress(current: number, total: number, stage: string) {
    this.info('Batch Progress', {
      progress: `${current}/${total}`,
      percentage: `${Math.round((current / total) * 100)}%`,
      stage,
    });
  }

  // 敏感信息过滤
  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined;

    const sanitized = { ...headers };

    // 隐藏 API Key 的敏感部分
    if (sanitized['x-goog-api-key']) {
      const key = sanitized['x-goog-api-key'];
      sanitized['x-goog-api-key'] = key.length > 20
        ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}`
        : '***';
    }

    if (sanitized['authorization']) {
      sanitized['authorization'] = '***';
    }

    return sanitized;
  }
}

// 导出单例
export const logger = new Logger();

// 根据环境变量设置日志级别
if (process.env.NODE_ENV === 'development') {
  logger.setLevel(LogLevel.DEBUG);
} else if (process.env.NODE_ENV === 'production') {
  logger.setLevel(LogLevel.INFO);
}
