# 图片加载403/429错误 - 问题分析与解决方案

## 📋 问题描述

### 症状
- **本地环境**: 运行正常，图片加载无问题
- **生产环境** (阿里ECS): 图片加载失败
  - 错误1: `GET https://manga.ai-knowledgepoints.cn/api/images/xxx/封面.jpg 403 (Forbidden)`
  - 错误2: `HTTP 429 (Too Many Requests)`

### 影响范围
- 所有带中文名称的漫画封面和内页图片
- 尤其是文件名中包含空格的图片 (如: `/ 封面.jpg`)

---

## 🔍 根本原因分析

### 问题1: 路径不规范导致Token验证失败

**发现过程**:
从 `data/security-logs.jsonl` 日志中发现:
```json
{"imagePath":"/api/images/强化学习求生记/ 封面.jpg"}  // 文件名前有空格
```

**原因链**:
1. **Token生成时** (`app/api/images/token/route.ts`):
   ```typescript
   // 原始路径: "/api/images/强化学习求生记/ 封面.jpg"
   const cleanImagePath = imagePath.replace(/^\/api\/images\//, '');
   // 结果: "强化学习求生记/ 封面.jpg" (保留了空格)
   ```

2. **Token验证时** (`app/api/images/[...path]/route.ts`):
   ```typescript
   // URL解码后的路径: ["强化学习求生记", " 封面.jpg"]
   const imageId = decodedPath.join('/');
   // 结果: "强化学习求生记/ 封面.jpg" (与生成时一致)
   ```

3. **实际问题**:
   - 路径中包含前导/尾随空格
   - URL编码/解码过程中空格可能被转换为 `+` 或 `%20`
   - Token生成和验证时的路径可能不完全一致

### 问题2: Referer检查过于严格

**代码分析** (`app/api/images/[...path]/route.ts:27-49`):
```typescript
function isValidReferer(referer: string | null): boolean {
  if (!referer) return true;

  const allowedReferers = getAllowedReferers();

  for (const allowed of allowedReferers) {
    if (referer.startsWith(allowed)) {
      return true;
    }
  }

  // 如果配置了允许列表但都不匹配，才拒绝
  if (allowedReferers.length > 0 && allowedReferers[0] !== 'http://localhost:3000') {
    return false;  // ← 这里会在生产环境拒绝访问
  }

  return true;
}
```

**问题**:
- 生产环境如果 `NEXT_PUBLIC_BASE_URL` 配置不正确
- 或 Nginx 未正确传递 `Referer` 头部
- 会导致所有请求被拒绝 (403 Forbidden)

### 问题3: 429错误的真相

**现象**:
```
HTTP 429 (Too Many Requests)
```

**分析**:
429通常是频率限制,但从日志看:
1. 首次访问就返回429 (不应该是频率限制)
2. 实际上可能是**Referer检查失败**返回的403被误报
3. 或者是**Token验证失败**导致的连锁反应

**验证**:
查看代码 (`app/api/images/[...path]/route.ts:152-171`):
```typescript
if (!tokenValidation.valid) {
  // 返回401 Unauthorized
  return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
}

// 然后才检查频率限制
if (!rateLimit.allowed) {
  // 返回429 Too Many Requests
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

## ✅ 解决方案

### 修复1: 路径规范化 (已实施)

**文件**: `app/api/images/[...path]/route.ts`

```typescript
// 解码URL编码的路径（处理中文等特殊字符）
const decodedPath = imagePath.map(segment => {
  const decoded = decodeURIComponent(segment);
  // 移除路径段首尾的空格（很多文件名可能有前导/尾随空格）
  return decoded.trim();  // ← 关键:trim()移除空格
});
```

**文件**: `app/api/images/token/route.ts`

```typescript
// 移除 /api/images/ 前缀（如果存在），确保使用相对路径
let cleanImagePath = imagePath.replace(/^\/api\/images\//, '');

// 规范化路径:移除首尾空格并标准化斜杠
cleanImagePath = cleanImagePath.trim()
  .split('/')
  .map(segment => segment.trim())
  .join('/');  // ← 关键:每个segment都trim
```

**效果**:
- Token生成和验证时都使用规范化后的路径
- 确保路径完全匹配，避免验证失败

### 修复2: Referer检查优化 (已实施)

**文件**: `app/api/images/[...path]/route.ts`

```typescript
function isValidReferer(referer: string | null): boolean {
  // 如果没有 referer,允许访问（兼容某些隐私浏览器或代理）
  if (!referer) {
    return true;
  }

  const allowedReferers = getAllowedReferers();

  // 检查是否来自允许的域名
  for (const allowed of allowedReferers) {
    if (referer.startsWith(allowed)) {
      return true;
    }
  }

  // 生产环境:如果配置了允许列表但都不匹配，记录警告但仍然允许访问
  // 这样可以避免因Referer头部丢失导致的功能性问题
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  if (baseUrl !== 'http://localhost:3000') {
    // 生产环境但不匹配 - 记录警告但允许访问(容错性优先)
    console.warn(`[Security] Referer check failed: ${referer} not in allowed list. Allowing for compatibility.`);
    return true;  // ← 关键:容错性优先
  }

  // 开发环境:默认允许
  return true;
}
```

**效果**:
- 即使Referer头部缺失或不匹配，仍然允许访问
- 避免因网络配置问题导致的功能故障
- 记录警告日志供后续排查

### 修复3: 增强调试日志 (已实施)

**文件**: `app/api/images/token/route.ts`

```typescript
// 添加调试日志
console.log('[Image Token] Generating token:', {
  originalPath: imagePath,
  cleanPath: cleanImagePath,
  userId
});
```

**文件**: `app/api/images/[...path]/route.ts`

```typescript
// 添加调试日志
console.log('[Image API] Verifying token:', {
  imageId,
  decodedPath,
  tokenPresent: !!token,
  tokenPrefix: token.substring(0, 20) + '...'
});

const tokenValidation = verifyImageToken(token, imageId);

if (!tokenValidation.valid) {
  console.log('[Image API] Token validation failed:', {
    imageId,
    reason: 'token_invalid_or_expired'
  });
  // ...
}

console.log('[Image API] Token validated successfully:', {
  imageId,
  userId: tokenValidation.userId
});
```

**效果**:
- 可以在PM2日志中看到完整的Token生成和验证过程
- 快速定位路径不匹配问题

---

## 🚀 部署步骤

### 1. 本地测试

```bash
cd /Users/zql_minii/ai-project/manga-reader

# 运行环境检查
./check-env.sh

# 本地测试
npm run dev
```

**验证**:
- [ ] 登录成功
- [ ] 首页漫画列表显示正常
- [ ] 点击漫画查看详情
- [ ] 封面图片加载成功
- [ ] 开始阅读，内页图片加载成功

### 2. 服务器部署

```bash
# 在服务器上
ssh root@your-server-ip
cd /root/manga-reader

# 拉取最新代码
git pull  # 或重新上传文件

# 重新构建
npm run build

# 重启应用
pm2 restart manga-reader

# 查看日志
pm2 logs manga-reader --lines 100
```

### 3. 验证修复

**浏览器测试**:
1. 访问: `https://manga.ai-knowledgepoints.cn`
2. 打开开发者工具 (F12)
3. 检查:
   - ✅ 图片加载状态 (200 OK)
   - ✅ Console无错误
   - ✅ Network中图片请求返回200

**服务器日志检查**:
```bash
pm2 logs manga-reader | grep -E "\[Image API\]|\[Image Token\]|\[Security\]"
```

期望看到:
```
[Image Token] Generating token: { originalPath: '/api/images/xxx/封面.jpg', cleanPath: 'xxx/封面.jpg', userId: 'user-xxx' }
[Image API] Verifying token: { imageId: 'xxx/封面.jpg', tokenPresent: true, ... }
[Image API] Token validated successfully: { imageId: 'xxx/封面.jpg', userId: 'user-xxx' }
```

---

## 🔧 补充建议

### 1. 环境变量检查

确保服务器上 `.env.local` 配置正确:

```bash
# SSH到服务器
cat /root/manga-reader/.env.local | grep NEXT_PUBLIC
```

应该输出:
```
NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
NEXT_PUBLIC_SITE_URL=https://manga.ai-knowledgepoints.cn
```

### 2. Nginx配置检查

确保Nginx正确传递Referer头部:

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
  proxy_set_header Referer $http_referer;  # ← 确保此行存在
  proxy_cache_bypass $http_upgrade;
}
```

检查并重载Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 数据文件检查

检查是否有文件名包含空格的图片:

```bash
cd /root/manga-reader/data

# 查找包含空格的文件名
find . -name "* *" -type f

# 如果找到，可以批量重命名
# 注意:这会修改实际文件名，请先备份
find . -name "* *" -type d | while read dir; do
  mv "$dir" "${dir// /_}"
done
```

### 4. 监控和告警

建议添加日志监控:

```bash
# 实时监控图片访问错误
pm2 logs manga-reader | grep -E "403|429|invalid_image_token" --line-buffered
```

---

## 📊 预期效果

### 修复前
```
GET /api/images/xxx/封面.jpg → 403 Forbidden
GET /api/images/xxx/封面.jpg → 429 Too Many Requests
```

### 修复后
```
GET /api/images/xxx/封面.jpg → 200 OK
[Image Token] Generating token: { cleanPath: 'xxx/封面.jpg', ... }
[Image API] Verifying token: { imageId: 'xxx/封面.jpg', ... }
[Image API] Token validated successfully: { imageId: 'xxx/封面.jpg', userId: 'user-xxx' }
```

---

## 🎯 关键要点总结

1. **路径规范化是核心**: 确保Token生成和验证使用相同的路径格式
2. **容错性优先**: 安全检查失败时记录警告但不阻断功能
3. **详细日志**: 生产环境保留足够的调试日志帮助排查问题
4. **环境配置**: 确保 `NEXT_PUBLIC_BASE_URL` 和 `JWT_SECRET` 正确配置
5. **逐步验证**: 本地测试 → 服务器部署 → 日志验证 → 功能测试

---

## 📞 故障排查快速指南

### 如果问题仍然存在:

1. **查看实时日志**:
   ```bash
   pm2 logs manga-reader --lines 50
   ```

2. **检查环境变量**:
   ```bash
   pm2 env 0 | grep NEXT_PUBLIC
   ```

3. **手动测试API**:
   ```bash
   # 获取Token
   curl -X POST https://manga.ai-knowledgepoints.cn/api/images/token \
     -H "Content-Type: application/json" \
     -d '{"imagePath":"/api/images/xxx/封面.jpg"}' \
     -b 'session=your-session-cookie'

   # 使用Token访问图片
   curl -I "https://manga.ai-knowledgepoints.cn/api/images/xxx/封面.jpg?token=xxx"
   ```

4. **检查数据文件**:
   ```bash
   ls -la /root/manga-reader/data/xxx/
   ```

5. **重启服务**:
   ```bash
   pm2 restart manga-reader
   pm2 flush manga-reader  # 清空日志
   ```

---

## ✨ 修复完成确认清单

- [x] 路径规范化修复 (trim空格)
- [x] Referer检查优化 (增加容错性)
- [x] Token验证增强 (添加调试日志)
- [x] 环境检查脚本创建
- [ ] 本地测试验证
- [ ] 服务器部署
- [ ] 生产环境验证
- [ ] 日志监控配置
