# Manga-Reader API 文档

> **基础URL**: `http://localhost:3000/api`
> **数据格式**: JSON
> **认证方式**: Cookie-based Session

---

## 📑 目录

- [1. 概述](#1-概述)
- [2. 认证 API](#2-认证-api)
- [3. 漫画 API](#3-漫画-api)
- [4. 章节 API](#4-章节-api)
- [5. 评论 API](#5-评论-api)
- [6. 收藏 API](#6-收藏-api)
- [7. 图片 API](#7-图片-api)
- [8. 统计 API](#8-统计-api)
- [9. 用户 API](#9-用户-api)
- [10. 错误码](#10-错误码)

---

## 1. 概述

### 1.1 通用响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 1.2 认证说明

大部分 API 不需要认证，以下接口需要登录：

- ✅ `POST /api/favorites/toggle` - 切换收藏
- ✅ `GET /api/favorites/check` - 检查收藏状态
- ✅ `GET /api/favorites` - 获取收藏列表
- ✅ `POST /api/comments` - 发表评论
- ✅ `POST /api/comments/[id]/like` - 评论点赞

认证方式：Cookie 自动携带

---

## 2. 认证 API

### 2.1 用户注册

**端点**: `POST /api/auth/register`

**请求体**:
```json
{
  "email": "user@example.com",
  "username": "用户名",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "用户名"
  }
}
```

**错误**:
- `400`: 邮箱已存在
- `400`: 用户名已存在
- `400`: 密码少于6位

---

### 2.2 用户登录

**端点**: `POST /api/auth/login`

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "用户名"
  }
}
```

**Set-Cookie**:
```
session=uuid; HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=604800
```

**错误**:
- `401`: 邮箱或密码错误

---

### 2.3 用户登出

**端点**: `POST /api/auth/logout`

**响应**:
```json
{
  "success": true
}
```

**Set-Cookie**:
```
session=; Max-Age=0; Path=/
```

---

### 2.4 获取当前用户

**端点**: `GET /api/auth/me`

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "用户名"
  }
}
```

**未登录**:
```json
{
  "success": false,
  "error": "未登录"
}
```

---

### 2.5 请求密码重置

**端点**: `POST /api/auth/reset-password/request`

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**响应**:
```json
{
  "success": true,
  "message": "重置邮件已发送"
}
```

---

### 2.6 确认密码重置

**端点**: `POST /api/auth/reset-password/confirm`

**请求体**:
```json
{
  "token": "重置token",
  "newPassword": "newPassword123"
}
```

**响应**:
```json
{
  "success": true,
  "message": "密码已重置"
}
```

---

## 3. 漫画 API

### 3.1 获取本地漫画列表

**端点**: `GET /api/manga/local`

**响应**:
```json
{
  "success": true,
  "manga": [
    {
      "id": "uuid",
      "title": "漫画标题",
      "author": "作者",
      "description": "简介",
      "coverImage": "/api/images/.../封面.png",
      "status": "ongoing",
      "categories": ["机器学习", "深度学习"],
      "tags": ["入门", "基础"],
      "updateTime": "2025-01-01T00:00:00.000Z",
      "views": 100,
      "likes": 50,
      "chapters": [
        {
          "id": "uuid",
          "title": "第1话",
          "pages": ["/api/images/.../1.png", ...],
          "updateTime": "2025-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

**说明**:
- 自动扫描 `data/` 目录
- 支持多章节和单章节两种模式
- 图片路径为 API 端点，不是文件系统路径

---

### 3.2 获取单个漫画

**端点**: `GET /api/manga/[id]`

**路径参数**:
- `id`: 漫画 ID

**响应**:
```json
{
  "success": true,
  "manga": {
    "id": "uuid",
    "title": "漫画标题",
    ...
  }
}
```

**错误**:
- `404`: 漫画不存在

---

### 3.3 增加浏览量

**端点**: `POST /api/manga/[id]/view`

**路径参数**:
- `id`: 漫画 ID

**响应**:
```json
{
  "success": true,
  "views": 101
}
```

---

### 3.4 切换点赞

**端点**: `POST /api/manga/[id]/like`

**路径参数**:
- `id`: 漫画 ID

**Cookie**: 需要登录

**响应** (点赞):
```json
{
  "success": true,
  "liked": true,
  "count": 51
}
```

**响应** (取消点赞):
```json
{
  "success": true,
  "liked": false,
  "count": 50
}
```

---

### 3.5 获取数据源信息

**端点**: `GET /api/manga/source-info`

**响应**:
```json
{
  "success": true,
  "source": "local",
  "dataPath": "/path/to/data",
  "scanTime": "2025-01-01T00:00:00.000Z"
}
```

---

### 3.6 获取元数据

**端点**: `GET /api/manga/meta`

**响应**:
```json
{
  "success": true,
  "meta": {
    "totalManga": 10,
    "totalChapters": 50,
    "totalViews": 1000
  }
}
```

---

## 4. 章节 API

### 4.1 获取章节详情

**端点**: `GET /api/chapter/[id]`

**路径参数**:
- `id`: 章节 ID

**响应**:
```json
{
  "success": true,
  "chapter": {
    "id": "uuid",
    "title": "第1话",
    "pages": [
      "/api/images/.../1.png",
      "/api/images/.../2.png"
    ],
    "updateTime": "2025-01-01T00:00:00.000Z",
    "manga": {
      "id": "uuid",
      "title": "漫画标题",
      "author": "作者"
    }
  }
}
```

**错误**:
- `404`: 章节不存在

---

## 5. 评论 API

### 5.1 获取评论列表

**端点**: `GET /api/comments?mangaId=[mangaId]`

**查询参数**:
- `mangaId` (可选): 漫画 ID，过滤特定漫画的评论

**响应**:
```json
{
  "success": true,
  "comments": {
    "commentId1": {
      "id": "commentId1",
      "mangaId": "mangaUuid",
      "userId": "userUuid",
      "username": "用户名",
      "content": "评论内容",
      "likes": 10,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 5.2 发表评论

**端点**: `POST /api/comments`

**Cookie**: 需要登录

**请求体**:
```json
{
  "mangaId": "mangaUuid",
  "content": "评论内容"
}
```

**响应**:
```json
{
  "success": true,
  "comment": {
    "id": "commentUuid",
    "mangaId": "mangaUuid",
    "userId": "userUuid",
    "username": "用户名",
    "content": "评论内容",
    "likes": 0,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**错误**:
- `401`: 未登录
- `400`: 内容为空

---

### 5.3 评论点赞

**端点**: `POST /api/comments/[id]/like`

**路径参数**:
- `id`: 评论 ID

**Cookie**: 需要登录

**响应**:
```json
{
  "success": true,
  "likes": 11
}
```

---

## 6. 收藏 API

### 6.1 检查收藏状态

**端点**: `GET /api/favorites/check?mangaId=[mangaId]`

**查询参数**:
- `mangaId`: 漫画 ID

**Cookie**: 需要登录

**响应** (已收藏):
```json
{
  "success": true,
  "isFavorited": true
}
```

**响应** (未收藏):
```json
{
  "success": true,
  "isFavorited": false
}
```

---

### 6.2 获取收藏列表

**端点**: `GET /api/favorites?userId=[userId]`

**查询参数**:
- `userId` (可选): 用户 ID

**Cookie**: 需要登录

**响应**:
```json
{
  "success": true,
  "favorites": [
    {
      "userId": "userUuid",
      "mangaId": "mangaUuid",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "manga": {
        "id": "mangaUuid",
        "title": "漫画标题",
        "coverImage": "/api/images/...",
        "author": "作者"
      }
    }
  ]
}
```

---

### 6.3 切换收藏

**端点**: `POST /api/favorites/toggle`

**Cookie**: 需要登录

**请求体**:
```json
{
  "mangaId": "mangaUuid"
}
```

**响应** (添加收藏):
```json
{
  "success": true,
  "isFavorited": true,
  "message": "已添加到收藏"
}
```

**响应** (取消收藏):
```json
{
  "success": true,
  "isFavorited": false,
  "message": "已取消收藏"
}
```

---

## 7. 图片 API

### 7.1 获取图片

**端点**: `GET /api/images/[...path]`

**路径参数**:
- `path`: 图片相对路径（相对于 `data/` 目录）

**示例**:
```
GET /api/images/机器学习基础/第1话/1.png
```

**响应**:
- Content-Type: `image/png`
- 图片二进制数据

**保护机制**:
- 禁止直接访问文件系统
- 所有图片通过 API 代理
- 支持鉴权（可扩展）

---

## 8. 统计 API

### 8.1 获取网站统计

**端点**: `GET /api/stats`

**响应**:
```json
{
  "success": true,
  "stats": {
    "userCount": 100,
    "mangaCount": 50,
    "chapterCount": 200,
    "totalViews": 10000
  }
}
```

---

## 9. 用户 API

### 9.1 获取用户信息

**端点**: `GET /api/user/[id]`

**路径参数**:
- `id`: 用户 ID

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "用户名",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**错误**:
- `404`: 用户不存在

---

## 10. 错误码

### 10.1 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| `200` | 成功 |
| `400` | 请求参数错误 |
| `401` | 未认证 |
| `404` | 资源不存在 |
| `500` | 服务器内部错误 |

### 10.2 业务错误码

| 错误信息 | 说明 |
|----------|------|
| `邮箱已存在` | 注册时邮箱已被使用 |
| `用户名已存在` | 注册时用户名已被使用 |
| `密码少于6位` | 密码长度不足 |
| `邮箱或密码错误` | 登录凭证错误 |
| `未登录` | 缺少认证 |
| `漫画不存在` | 漫画 ID 无效 |
| `章节不存在` | 章节 ID 无效 |
| `用户不存在` | 用户 ID 无效 |
| `内容为空` | 评论内容为空 |
| `操作失败` | 通用错误 |

---

## 附录

### A. Postman 集合

可以导入以下 Postman 集合进行测试：

```json
{
  "info": {
    "name": "Manga-Reader API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "认证",
      "item": [
        {
          "name": "注册",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"username\": \"测试用户\",\n  \"password\": \"password123\"\n}",
              "options": { "raw": { "language": "json" } }
            },
            "url": { "raw": "{{baseUrl}}/auth/register", "host": ["{{baseUrl}}"], "path": ["auth", "register"] }
          }
        }
      ]
    }
  ]
}
```

### B. 使用示例

#### JavaScript/TypeScript

```typescript
// 获取漫画列表
async function getMangaList() {
  const response = await fetch('/api/manga/local')
  const data = await response.json()
  return data.manga
}

// 登录
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await response.json()
  return data.user
}

// 切换收藏
async function toggleFavorite(mangaId: string) {
  const response = await fetch('/api/favorites/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mangaId })
  })
  const data = await response.json()
  return data.isFavorited
}
```

#### cURL

```bash
# 获取漫画列表
curl http://localhost:3000/api/manga/local

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# 获取当前用户（使用 Cookie）
curl http://localhost:3000/api/auth/me -b cookies.txt

# 切换收藏（使用 Cookie）
curl -X POST http://localhost:3000/api/favorites/toggle \
  -H "Content-Type: application/json" \
  -d '{"mangaId":"manga-uuid"}' \
  -b cookies.txt
```

### C. 速率限制

目前 API 没有速率限制，建议生产环境添加：

```typescript
// 使用 next-rate-limit 或类似库
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 个请求
})
```

---

**文档版本**: v1.0
**最后更新**: 2025-12-30
**维护者**: 开发团队
