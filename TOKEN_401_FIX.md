# 401 Unauthorized 错误诊断和解决方案

## 🚨 当前问题

```
POST https://manga.ai-knowledgepoints.cn/api/images/tokens 401 (Unauthorized)
ProtectedImage.tsx:168 Failed to get image token for: AI读懂人话有多难/封面.jpg
```

## 📊 问题分析

### Token机制说明

**什么是Token？**
- Token是一个临时访问令牌（JWT格式）
- 有效期5分钟
- 包含用户ID和图片路径信息
- 防止未登录用户直接访问图片

**为什么需要Token？**
1. **防盗链** - 防止其他网站直接引用图片
2. **访问控制** - 只有登录用户能访问
3. **访问追踪** - 记录用户阅读行为
4. **时效限制** - Token过期后需要重新获取

**工作流程：**
```
1. 用户访问漫画列表
   ↓
2. 前端批量请求Token: POST /api/images/tokens
   Body: { imagePaths: ["xxx/封面.jpg", "yyy/封面.jpg"] }
   ↓ (需要登录Cookie)
3. 服务器验证登录 → 生成Token
   Response: { success: true, tokens: { "xxx/封面.jpg": "token1", ... } }
   ↓
4. 前端用Token访问图片: GET /api/images/xxx/封面.jpg?token=xxx
   ↓
5. 服务器验证Token → 返回图片
```

---

## 🔍 401错误的可能原因

### 原因1: 未登录或Session过期 ⭐ (最可能)

**检查方法：**

#### 方法A: 使用浏览器开发者工具

1. 打开 `https://manga.ai-knowledgepoints.cn`
2. 按F12打开开发者工具
3. 切换到 **Application** 标签
4. 左侧选择 **Cookies** > `https://manga.ai-knowledgepoints.cn`
5. 查找名为 `session` 的Cookie

**期望结果：**
- ✅ 有一个 `session` Cookie
- ✅ Cookie的Domain是 `.ai-knowledgepoints.cn` 或 `manga.ai-knowledgepoints.cn`

**如果看不到Session Cookie：**
- ❌ 用户未登录
- ✅ 解决: 登录系统

#### 方法B: 使用调试页面

访问: `https://manga.ai-knowledgepoints.cn/debug`

点击 **"1. 检查登录状态和Token API"** 按钮

查看输出:
```json
{
  "hasSession": true,
  "cookies": "session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenResponse": {
    "status": 200,
    "ok": true,
    "data": {
      "success": true,
      "tokens": { "test/封面.jpg": "token..." }
    }
  }
}
```

### 原因2: 生产环境Cookie Domain配置错误

**检查服务器配置：**

```bash
# SSH到服务器
ssh root@your-server-ip

# 检查环境变量
cat /root/manga-reader/.env.local | grep -E "NEXT_PUBLIC_BASE_URL|NEXT_PUBLIC_SITE_URL"
```

**期望输出：**
```
NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
NEXT_PUBLIC_SITE_URL=https://manga.ai-knowledgepoints.cn
```

**如果配置错误：**
```bash
# 编辑配置
nano /root/manga-reader/.env.local

# 修改为正确的域名
NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
NEXT_PUBLIC_SITE_URL=https://manga.ai-knowledgepoints.cn

# 重启应用
pm2 restart manga-reader
```

### 原因3: Nginx未正确传递Cookie

**检查Nginx配置：**

```bash
# 查看Nginx配置
cat /etc/nginx/sites-available/manga-reader
```

**确保包含以下配置：**
```nginx
location / {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # ⚠️ 关键: 确保这些行存在
    proxy_set_header Cookie $http_cookie;
    proxy_set_header Referer $http_referer;
}
```

**修复并重载：**
```bash
sudo nano /etc/nginx/sites-available/manga-reader
sudo nginx -t
sudo systemctl reload nginx
```

### 原因4: Session数据丢失或损坏

**检查Session文件：**

```bash
# 查看Session数据
cat /root/manga-reader/data/sessions.json | jq '.'
```

**验证Session：**
```json
[
  {
    "sessionId": "xxx",
    "userId": "user-xxx",
    "expiresAt": 1234567890
  }
]
```

**如果Session文件为空或损坏：**
```bash
# 备份
cp /root/manga-reader/data/sessions.json /root/sessions.json.bak

# 清空Session（强制用户重新登录）
echo '[]' > /root/manga-reader/data/sessions.json

# 重启应用
pm2 restart manga-reader
```

---

## 🛠️ 解决方案步骤

### 步骤1: 本地测试

```bash
cd /Users/zql_minii/ai-project/manga-reader

# 启动本地测试
npm run dev
```

**访问：** `http://localhost:3000/debug`

**验证：**
- [ ] 点击按钮检查Token API
- [ ] 查看是否返回200
- [ ] 查看浏览器Console日志

### 步骤2: 查看服务器日志

```bash
# SSH到服务器
ssh root@your-server-ip

# 查看实时日志
pm2 logs manga-reader --lines 100 | grep -E "\[Image Tokens Batch\]|Checking auth"
```

**期望看到：**
```
[Image Tokens Batch] Checking auth: { hasSessionCookie: true, sessionValue: 'eyJhbGci...' }
[Image Tokens Batch] Session validation: { userId: 'user-xxx', hasUserId: true }
[Image Tokens Batch] User authenticated: { userId: 'user-xxx', username: 'xxx' }
[Image Tokens Batch] Request received: { userId: 'user-xxx', pathsCount: 10, ... }
[Image Tokens Batch] Generated tokens: { userId: 'user-xxx', count: 10, ... }
```

**如果看到：**
```
[Image Tokens Batch] No session cookie found
[Image Tokens Batch] Invalid session - no userId extracted
```
说明用户未登录或Session无效

### 步骤3: 清除浏览器Cookie并重新登录

**方法A: 手动清除**
1. 打开开发者工具 (F12)
2. Application > Cookies
3. 右键 `session` Cookie > Delete
4. 刷新页面
5. 重新登录

**方法B: 自动化脚本（在Console中执行）**
```javascript
// 在浏览器Console中执行
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] +
    '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.ai-knowledgepoints.cn';
});
location.reload();
```

### 步骤4: 手动测试API

```bash
# 在服务器上测试（使用curl）
curl -X POST http://localhost:4000/api/images/tokens \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE_HERE" \
  -d '{"imagePaths":["/api/images/test/封面.jpg"]}'
```

**获取Session Cookie的方法：**
1. 浏览器开发者工具 > Application > Cookies
2. 复制 `session` 的Value
3. 替换上面的 `YOUR_SESSION_COOKIE_HERE`

---

## 🎯 快速修复检查清单

### 前端检查
- [ ] 清除浏览器Cookie
- [ ] 重新登录系统
- [ ] 检查Console是否有JavaScript错误
- [ ] 访问 `/debug` 页面进行诊断

### 后端检查
- [ ] 确认环境变量 `NEXT_PUBLIC_BASE_URL` 正确
- [ ] 确认Nginx正确传递Cookie头部
- [ ] 查看PM2日志，检查Token生成过程
- [ ] 验证Session数据文件存在且格式正确

### 日志检查
- [ ] 查看 `[Image Tokens Batch]` 日志
- [ ] 确认 `hasSessionCookie: true`
- [ ] 确认 `userId` 成功提取
- [ ] 确认Token成功生成

---

## 🔧 调试命令参考

### 查看PM2日志
```bash
# 实时日志
pm2 logs manga-reader

# 过滤Token相关日志
pm2 logs manga-reader | grep "Image Tokens"

# 查看最近100行
pm2 logs manga-reader --lines 100

# 清空日志
pm2 flush manga-reader
```

### 重启服务
```bash
# 重启Next.js
pm2 restart manga-reader

# 重启Nginx
sudo systemctl reload nginx

# 检查服务状态
pm2 status
sudo systemctl status nginx
```

### 检查端口占用
```bash
# 检查4000端口
netstat -tuln | grep 4000

# 检查进程
ps aux | grep next
```

---

## 📝 已实施的修复

### 1. 增强调试日志

**文件修改：**
- `app/api/images/tokens/route.ts` - 添加详细的Token生成日志
- `app/api/images/token/route.ts` - 添加单个Token生成的日志
- `app/api/images/[...path]/route.ts` - 添加Token验证日志

**日志内容：**
- Session Cookie检查
- 用户ID提取
- Token生成结果
- 路径规范化过程

### 2. 路径规范化

**修改位置：**
- 所有Token相关API都统一了路径处理
- 使用 `.trim()` 移除空格
- 标准化路径格式

### 3. 创建调试工具

**新增文件：**
- `app/debug/page.tsx` - 可视化诊断页面
- 本文档 - 完整的故障排查指南

---

## ✨ 预期效果

### 修复前
```
POST /api/images/tokens → 401 Unauthorized
Failed to get image token
```

### 修复后
```
POST /api/images/tokens → 200 OK
[Image Tokens Batch] User authenticated: { userId: 'user-xxx', username: 'test' }
[Image Tokens Batch] Generated tokens: { count: 10 }
GET /api/images/xxx/封面.jpg?token=xxx → 200 OK
```

---

## 💡 额外建议

### 1. 禁用Token机制（仅用于测试）

如果Token机制导致太多问题，可以临时禁用：

**修改 `app/api/images/[...path]/route.ts`：**
```typescript
// 在GET函数开始处添加：
export async function GET(request, { params }) {
  // 临时禁用Token验证
  const BYPASS_TOKEN = true;  // ⚠️ 仅用于测试

  if (!BYPASS_TOKEN) {
    // 原有的Token验证逻辑
  }

  // ... 后续代码
}
```

⚠️ **警告：** 这会移除所有安全保护，任何人都能访问图片！

### 2. 使用更简单的认证方式

如果不需要严格的访问控制，可以考虑：
- 使用HTTP Basic Authentication
- 使用IP白名单
- 使用Nginx的访问控制

### 3. 监控和告警

设置自动监控：
```bash
# 监控401错误
pm2 logs manga-reader | grep "401" --line-buffered | while read line; do
  echo "$line" | mail -s "401 Error Detected" admin@example.com
done
```

---

## 📞 如果问题仍然存在

### 收集诊断信息

1. **浏览器Console日志**（完整的错误堆栈）
2. **浏览器Network标签**（请求/响应详情）
3. **服务器日志**（PM2日志相关部分）
4. **Cookie信息**（Application > Cookies截图）
5. **环境变量**（`.env.local` 内容，隐藏敏感信息）

### 提供信息示例

```
**浏览器Console:**
POST https://manga.ai-knowledgepoints.cn/api/images/tokens 401

**Network Request:**
Request URL: https://manga.ai-knowledgepoints.cn/api/images/tokens
Method: POST
Status: 401 Unauthorized
Request Headers:
  Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

**服务器日志:**
[Image Tokens Batch] Checking auth: { hasSessionCookie: false }
[Image Tokens Batch] No session cookie found

**环境变量:**
NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
JWT_SECRET=*** (hidden)
```

---

## 🎓 关键要点总结

1. **401错误 = 未登录或Session无效**
2. **Token机制需要登录Cookie才能工作**
3. **路径规范化已修复** (统一trim处理)
4. **调试日志已添加** (便于排查问题)
5. **使用 `/debug` 页面快速诊断**
6. **清除Cookie并重新登录通常能解决问题**
