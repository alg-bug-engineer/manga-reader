# 🔧 Gemini API 调试指南

## 常见问题及解决方案

### 问题 1: 连接超时错误 (Connect Timeout Error)

**错误信息：**
```
Error: Connect Timeout Error (attempted addresses: ..., timeout: 10000ms)
```

**原因分析：**
- 网络连接问题
- 防火墙阻止
- API 服务暂时不可用
- 超时时间设置过短

**解决方案：**

1. **检查网络连接**
```bash
# 测试是否能访问 Gemini API
curl -I "https://generativelanguage.googleapis.com"
```

2. **增加超时时间**
代码已将超时时间从默认的 10 秒增加到 120 秒。

3. **配置代理（如果在中国大陆）**
```bash
# 设置 HTTP 代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 然后启动开发服务器
npm run dev
```

4. **使用 VPN 或其他网络工具**
确保可以正常访问 Google 服务。

---

### 问题 2: API Key 无效

**错误信息：**
```
Error: 请先配置有效的 GEMINI_API_KEY 环境变量
```

**解决方案：**

1. **检查环境变量是否配置**
```bash
# 查看当前环境变量
cat .env.local

# 应该看到类似内容：
# GEMINI_API_KEY=AIzaSy...
```

2. **获取有效的 API Key**
   - 访问：https://makersuite.google.com/app/apikey
   - 登录 Google 账号
   - 创建新的 API Key
   - 复制 API Key

3. **正确配置 .env.local**
```bash
# 复制示例文件
cp .env.example .env.local

# 编辑文件，替换 API Key
# 将 your_gemini_api_key_here 替换为真实 Key
```

4. **重启开发服务器**
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

---

### 问题 3: API Key 已过期或被禁用

**错误信息：**
```json
{
  "error": {
    "code": 401,
    "message": "API key invalid"
  }
}
```

**解决方案：**

1. **检查 API Key 状态**
   - 访问 Google Cloud Console
   - 检查 API Key 是否被禁用
   - 检查 API Key 是否有使用配额

2. **创建新的 API Key**
   - 在 Google AI Studio 创建新 Key
   - 更新 .env.local 文件
   - 重启服务器

3. **检查配额限制**
   - 确保 API Key 有足够的配额
   - 升级到付费计划（如需要）

---

### 问题 4: 请求格式错误

**错误信息：**
```json
{
  "error": {
    "code": 400,
    "message": "Invalid request"
  }
}
```

**解决方案：**

1. **检查请求格式**
代码已使用官方推荐的格式：
```typescript
{
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY,
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: "..." }]
    }]
  })
}
```

2. **检查模型名称**
确保使用的是有效的模型名称：
- `gemini-2.0-flash-exp` ✅
- `gemini-1.5-pro` ✅
- `gemini-3-pro-preview` ✅

---

### 问题 5: 生成内容为空

**错误信息：**
```
Error: 无法解析生成的脚本
```

**解决方案：**

1. **检查 API 响应**
在浏览器控制台查看完整的 API 响应。

2. **简化提示词**
如果提示词过长，可能导致生成失败。可以暂时减少脚本格数。

3. **调整生成参数**
```typescript
generationConfig: {
  temperature: 0.8,    // 降低到 0.5 试试
  maxOutputTokens: 8192, // 增加到 16384
}
```

---

## 调试工具和技巧

### 1. 使用 curl 测试 API

```bash
# 设置环境变量
export GEMINI_API_KEY="your_actual_api_key"

# 测试脚本生成
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello, Gemini!"}]
    }]
  }'
```

### 2. 查看详细日志

在代码中添加 console.log：
```typescript
console.log('API Request:', {
  url: `https://generativelanguage.googleapis.com/...`,
  headers: { 'Content-Type': 'application/json' },
  body: requestBody
});

const response = await fetch(...);
console.log('API Response Status:', response.status);
console.log('API Response Headers:', response.headers);
```

### 3. 使用浏览器开发者工具

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 执行操作
4. 查看 API 请求的详细信息：
   - Request URL
   - Request Headers
   - Request Body
   - Response Status
   - Response Body

### 4. 检查环境变量

在 Next.js API 路由中添加调试代码：
```typescript
// app/api/generate-comic/script/route.ts
export async function POST(request: NextRequest) {
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
  console.log('GEMINI_SCRIPT_MODEL:', process.env.GEMINI_SCRIPT_MODEL);
  // ...
}
```

---

## 网络问题解决方案

### 方案 1: 使用代理

**安装代理工具：**
- Clash
- V2Ray
- Shadowsocks

**配置环境变量：**
```bash
# Linux / macOS
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
npm run dev

# Windows (PowerShell)
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
npm run dev
```

### 方案 2: 使用 Next.js 代理

创建自定义服务器配置：
```javascript
// next.config.ts
export default {
  async rewrites() {
    return [
      {
        source: '/api/gemini/:path*',
        destination: 'https://generativelanguage.googleapis.com/:path*',
      },
    ];
  },
};
```

### 方案 3: 使用 CORS 代理

修改 API 请求 URL：
```typescript
const response = await fetch(
  `https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/...`,
  // ...
);
```

---

## 性能优化建议

### 1. 启用缓存

```typescript
// 简单的内存缓存
const cache = new Map();

export async function generateComicScript(concept: string) {
  const cacheKey = `script_${concept}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // ... 生成脚本 ...

  cache.set(cacheKey, panels);
  return panels;
}
```

### 2. 使用流式响应

```typescript
const response = await fetch(..., {
  // ...
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value);
  // 处理流式数据
}
```

### 3. 批量处理

```typescript
// 批量生成多张图片
const results = await Promise.allSettled(
  panels.map(panel => generatePanelImage(panel, style))
);
```

---

## 监控和日志

### 1. 添加日志记录

```typescript
// lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  api: (endpoint: string, duration: number) => {
    console.log(`[API] ${endpoint} - ${duration}ms`);
  }
};
```

### 2. 性能监控

```typescript
export async function generateComicScript(concept: string) {
  const startTime = Date.now();

  try {
    // ... API 调用 ...

    const duration = Date.now() - startTime;
    logger.api('generateComicScript', duration);

    return panels;
  } catch (error) {
    logger.error('generateComicScript failed', error);
    throw error;
  }
}
```

---

## 联系支持

如果以上方案都无法解决问题：

1. **查看 Gemini API 文档**
   https://ai.google.dev/docs

2. **检查 API 状态**
   https://status.cloud.google.com

3. **搜索类似问题**
   GitHub Issues
   Stack Overflow

4. **提交 Bug**
   创建 Issue 并附上：
   - 错误信息
   - 环境信息（OS, Node.js 版本）
   - 复现步骤
   - 日志截图

---

**最后更新：** 2025-12-31
**适用版本：** v1.0.0
