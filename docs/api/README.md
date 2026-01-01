# API 文档中心

> **版本**: v1.0
> **更新**: 2025-12-30

---

## 📚 API 路由索引

芝士AI吃鱼使用 Next.js App Router 的 Route Handlers 构建 API。

---

## 🔐 认证 API

### POST `/api/auth/register`
**用户注册**

**请求**:
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
    "id": "user-xxx",
    "email": "user@example.com",
    "username": "用户名"
  }
}
```

---

### POST `/api/auth/login`
**用户登录**

**请求**:
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
    "id": "user-xxx",
    "email": "user@example.com",
    "username": "用户名"
  }
}
```

**Cookie**: 设置 HttpOnly Session Cookie（7天有效期）

---

### POST `/api/auth/logout`
**用户登出**

**响应**:
```json
{
  "success": true
}
```

**Cookie**: 清除 Session Cookie

---

### GET `/api/auth/me`
**获取当前用户**

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "user-xxx",
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

## 📖 漫画 API

### GET `/api/manga/local`
**获取本地扫描的漫画数据**

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "manga-1",
      "title": "大模型入门",
      "author": "芝士AI",
      "description": "...",
      "coverImage": "/api/images/...",
      "status": "ongoing",
      "categories": ["NLP", "大模型"],
      "tags": ["LLM", "Transformer"],
      "chapters": [...],
      "updateTime": "2025-12-30T00:00:00.000Z",
      "views": 1000,
      "likes": 50
    }
  ],
  "meta": {
    "count": 1,
    "series": [
      { "name": "大模型入门", "chapters": 2 }
    ],
    "updateTime": "2025-12-29T11:38:00.000Z"
  }
}
```

---

### GET `/api/manga/[id]`
**获取单个漫画详情**

**响应**:
```json
{
  "success": true,
  "manga": {
    "id": "manga-1",
    "title": "大模型入门",
    ...
  }
}
```

---

### POST `/api/manga/[id]/view`
**记录浏览量**

**响应**:
```json
{
  "success": true,
  "views": 1001
}
```

---

### POST `/api/manga/[id]/like`
**点赞/取消点赞**

**响应**:
```json
{
  "success": true,
  "liked": true,
  "count": 51
}
```

---

### GET `/api/manga/[id]/like`
**获取点赞状态**

**响应**:
```json
{
  "success": true,
  "liked": true,
  "count": 51
}
```

---

## 📑 章节 API

### GET `/api/chapter/[id]`
**获取章节详情**

**响应**:
```json
{
  "success": true,
  "chapter": {
    "id": "chapter-1-1",
    "mangaId": "manga-1",
    "title": "第一话 强化学习求生记",
    "chapterNumber": 1,
    "pages": [
      "/api/images/大模型入门/第一话/封面.png",
      "/api/images/大模型入门/第一话/1.png",
      "/api/images/大模型入门/第一话/2.png"
    ],
    "updateTime": "2025-12-30T00:00:00.000Z"
  }
}
```

---

## 🖼️ 图片服务 API

### GET `/api/images/[...path]`
**获取本地图片**

**示例**:
```
GET /api/images/大模型入门/第一话/封面.png
```

**响应**: 图片文件（PNG/JPG/WebP/GIF）

**Headers**:
```
Content-Type: image/png
Cache-Control: public, max-age=31536000, immutable
```

**安全**: 路径遍历防护

---

## 💬 评论 API

### GET `/api/comments`
**获取评论列表**

**Query 参数**:
- `mangaId`: 漫画 ID
- `chapterId`: 章节 ID（可选）

**示例**:
```
GET /api/comments?mangaId=manga-1&chapterId=chapter-1-1
```

**响应**:
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment-1",
      "mangaId": "manga-1",
      "chapterId": "chapter-1-1",
      "userId": "user-1",
      "username": "用户名",
      "content": "很棒的漫画！",
      "likes": 5,
      "createdAt": "2025-12-30T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/comments`
**发表评论**

**请求**:
```json
{
  "mangaId": "manga-1",
  "chapterId": "chapter-1-1",
  "content": "很棒的漫画！"
}
```

**响应**:
```json
{
  "success": true,
  "comment": {
    "id": "comment-1",
    ...
  }
}
```

**要求**: 需要登录

---

### POST `/api/comments/[id]/like`
**评论点赞**

**响应**:
```json
{
  "success": true,
  "liked": true,
  "count": 6
}
```

---

## ⭐ 收藏 API

### GET `/api/favorites`
**获取用户收藏列表**

**响应**:
```json
{
  "success": true,
  "favorites": ["manga-1", "manga-2"]
}
```

**要求**: 需要登录

---

### GET `/api/favorites/check?mangaId=xxx`
**检查收藏状态**

**响应**:
```json
{
  "success": true,
  "isFavorited": true
}
```

---

### POST `/api/favorites/toggle`
**切换收藏状态**

**请求**:
```json
{
  "mangaId": "manga-1"
}
```

**响应**:
```json
{
  "success": true,
  "isFavorited": true
}
```

**要求**: 需要登录

---

## 📊 统计 API

### GET `/api/stats`
**获取网站统计数据**

**响应**:
```json
{
  "success": true,
  "stats": {
    "userCount": 5,
    "totalViews": 15000,
    "mangaCount": 6
  }
}
```

---

## 🔍 搜索 API（计划中）

### GET `/api/search?q=keyword`
**搜索漫画**

**Query 参数**:
- `q`: 搜索关键词

**响应**:
```json
{
  "success": true,
  "results": [
    {
      "id": "manga-1",
      "title": "大模型入门",
      "type": "title"
    }
  ],
  "count": 1
}
```

**状态**: ⏳ 计划中

---

## 📝 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

### HTTP 状态码
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未登录
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

---

## 🔐 认证机制

### Session Cookie
```
Name: session
Value: <session-id>
HttpOnly: true
Secure: true (production)
SameSite: lax
Max-Age: 604800 (7天)
```

### 使用方式
登录后，Cookie 会自动设置在后续请求中。

---

## 📊 数据结构

### Manga（漫画）
```typescript
interface Manga {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: string[];
  tags: string[];
  chapters: Chapter[];
  updateTime: string;
  views: number;
  likes: number;
}
```

### Chapter（章节）
```typescript
interface Chapter {
  id: string;
  mangaId: string;
  chapterNumber: number;
  title: string;
  pages: string[];
  updateTime: string;
}
```

### User（用户）
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}
```

### Comment（评论）
```typescript
interface Comment {
  id: string;
  mangaId: string;
  chapterId?: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
}
```

---

## 🚀 使用示例

### fetch 示例
```javascript
// 获取漫画列表
const response = await fetch('/api/manga/local');
const data = await response.json();

if (data.success) {
  console.log(data.data);
}

// 点赞
const likeResponse = await fetch('/api/manga/manga-1/like', {
  method: 'POST',
});
const likeData = await likeResponse.json();
```

---

**最后更新**: 2025-12-30
**API 版本**: v1.0
