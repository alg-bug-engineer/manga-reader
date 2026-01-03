# 📊 日志系统使用指南

## 概述

为了方便排查 Gemini API 请求问题，项目添加了完整的日志系统。所有 API 请求、响应、错误都会被详细记录。

## 日志级别

系统支持 4 个日志级别：

1. **DEBUG** - 最详细，包含所有调试信息
2. **INFO** - 一般信息，API 请求/响应
3. **WARN** - 警告信息
4. **ERROR** - 错误信息

### 自动配置

- **开发环境** (`npm run dev`)：使用 `DEBUG` 级别
- **生产环境** (`npm run build`)：使用 `INFO` 级别

## 日志输出位置

### 开发环境

所有日志会输出到：
- **终端控制台** - 运行 `npm run dev` 的终端
- **浏览器控制台** - 打开开发者工具 (F12)

### 生产环境

日志会输出到服务器日志，需要配置日志收集系统。

## 日志内容

### 1. 脚本生成日志

#### 初始化日志
```
[2025-12-31T10:00:00.000Z] [INFO] Gemini Service Initialized
{
  "hasApiKey": true,
  "apiKeyLength": 39,
  "scriptModel": "gemini-2.0-flash-exp",
  "imageModel": "gemini-2.0-flash-exp",
  "rateLimitDelay": 2000
}
```

#### 开始生成
```
[2025-12-31T10:00:01.000Z] [INFO] Script Generation Started
{
  "concept": "RAG",
  "style": "gemini-2.0-flash-exp",
  "timestamp": "2025-12-31T10:00:01.000Z"
}
```

#### API 请求日志
```
[2025-12-31T10:00:01.100Z] [INFO] API Request
{
  "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/...",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-goog-api-key": "AIzaSyDa...9XvM"
  },
  "hasBody": true,
  "bodySize": 5234
}
```

#### API 响应日志
```
[2025-12-31T10:00:05.500Z] [INFO] API Response
{
  "endpoint": "https://generativelanguage.googleapis.com/...",
  "status": 200,
  "statusText": "OK",
  "duration": "5400ms"
}
```

#### 生成成功
```
[2025-12-31T10:00:06.000Z] [INFO] Script Generation Success
{
  "panelsCount": 24,
  "duration": "5000ms",
  "avgTimePerPanel": "208ms"
}
```

#### 生成失败
```
[2025-12-31T10:00:10.000Z] [ERROR] Script Generation Failed
{
  "error": "Connect Timeout Error",
  "duration": "120000ms"
}
```

### 2. 图片生成日志

#### 单张图片生成
```
[2025-12-31T10:01:00.000Z] [INFO] Image Generation Started
{
  "panelNumber": 1,
  "style": "peach",
  "timestamp": "2025-12-31T10:01:00.000Z"
}

[2025-12-31T10:01:05.000Z] [INFO] Image Generation Success
{
  "panelNumber": 1,
  "duration": "5000ms",
  "imageSize": "125KB"
}
```

#### 批量生成
```
[2025-12-31T10:01:00.000Z] [INFO] Batch image generation started
{
  "totalPanels": 24,
  "style": "peach",
  "hasReference": false,
  "rateLimitDelay": 2000
}

[2025-12-31T10:01:05.000Z] [INFO] Batch Progress
{
  "progress": "1/24",
  "percentage": "4%",
  "stage": "Generating panel 1"
}

[2025-12-31T10:03:30.000Z] [INFO] Batch image generation completed
{
  "totalPanels": 24,
  "successCount": 24,
  "failureCount": 0,
  "totalDuration": "150000ms",
  "avgTimePerPanel": "6250ms",
  "successRate": "100%"
}
```

### 3. 错误日志

#### API Key 错误
```
[2025-12-31T10:00:00.000Z] [ERROR] Invalid API Key
{
  "hasApiKey": false,
  "keyValue": "..."
}
```

#### 网络超时
```
[2025-12-31T10:00:00.000Z] [ERROR] Request timeout
{
  "endpoint": "https://generativelanguage.googleapis.com/...",
  "timeout": 120000,
  "duration": 120000
}
```

#### 网络错误
```
[2025-12-31T10:00:00.000Z] [ERROR] Network error
{
  "endpoint": "https://generativelanguage.googleapis.com/...",
  "message": "fetch failed"
}
```

#### 解析错误
```
[2025-12-31T10:00:00.000Z] [ERROR] Failed to parse generated script
{
  "error": "Unexpected token...",
  "textLength": 1234,
  "textPreview": "[{\"panelNumber\": 1..."
}
```

## 如何查看日志

### 1. 终端日志

运行开发服务器后，所有日志会直接显示在终端：

```bash
npm run dev

# 输出示例：
# [2025-12-31T10:00:00.000Z] [INFO] Gemini Service Initialized
# [2025-12-31T10:00:01.000Z] [INFO] Script Generation Started
# ...
```

### 2. 浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 **Console** 标签
3. 执行操作（如生成漫画）
4. 查看日志输出

### 3. 保存日志到文件

#### 方法 1：重定向终端输出
```bash
npm run dev 2>&1 | tee logs/output.log
```

#### 方法 2：使用日志管理工具

安装 winston 等日志库，配置文件输出。

## 日志分析

### 1. 查找错误

```bash
# 搜索所有错误日志
grep "\[ERROR\]" logs/output.log

# 搜索特定错误
grep "timeout" logs/output.log
```

### 2. 性能分析

```bash
# 查看平均响应时间
grep "duration" logs/output.log

# 统计成功/失败次数
grep "Success\|Failed" logs/output.log | wc -l
```

### 3. 完整流程追踪

```bash
# 查看完整的生成流程
grep "Script Generation\|Image Generation" logs/output.log
```

## 调试技巧

### 1. 启用详细日志

在代码中临时添加：
```typescript
import { logger } from '@/lib/utils/logger';

// 启用最详细的日志
logger.setLevel(LogLevel.DEBUG);
```

### 2. 添加自定义日志

```typescript
import { logger } from '@/lib/utils/logger';

logger.info('My custom log', {
  someData: 'value',
  anotherData: 123,
});
```

### 3. 监控特定操作

```typescript
// 在开始时记录
const startTime = Date.now();
logger.debug('Operation started', { operationId: '12345' });

// 在结束时记录
const duration = Date.now() - startTime;
logger.debug('Operation completed', {
  operationId: '12345',
  duration: `${duration}ms`,
});
```

## 常见问题排查

### 问题 1：看不到日志

**可能原因：**
- 日志级别设置过高
- 日志输出位置不对

**解决方案：**
```typescript
// 设置为 DEBUG 级别
logger.setLevel(LogLevel.DEBUG);

// 确保在正确的环境
console.log('Current NODE_ENV:', process.env.NODE_ENV);
```

### 问题 2：日志太多

**可能原因：**
- 开发环境默认使用 DEBUG 级别

**解决方案：**
```typescript
// 只显示重要日志
logger.setLevel(LogLevel.INFO);
```

### 问题 3：敏感信息泄露

**已采取措施：**
- API Key 自动脱敏（只显示前10位和后5位）
- 参考图片数据不完整记录

**额外建议：**
- 生产环境不要使用 DEBUG 级别
- 定期清理日志文件
- 使用日志脱敏工具

## 最佳实践

1. **开发环境**
   - 使用 DEBUG 级别
   - 查看完整的请求/响应
   - 实时监控终端日志

2. **生产环境**
   - 使用 INFO 或 WARN 级别
   - 收集日志到日志服务器
   - 设置日志告警

3. **性能优化**
   - 避免在生产环境记录过多 DEBUG 日志
   - 使用异步日志写入
   - 定期清理旧日志

## 相关文件

- `lib/utils/logger.ts` - 日志工具实现
- `lib/services/geminiService.ts` - Gemini API 服务（已集成日志）

## 总结

日志系统已经完全集成到 Gemini API 服务中，可以帮你：

✅ 快速定位问题
✅ 监控 API 性能
✅ 追踪完整流程
✅ 分析失败原因
✅ 优化请求配置

所有日志都会自动记录，无需手动配置。只需查看控制台即可！

---

*更新时间：2025-12-31*
*版本：v1.0.0*
