# 数据管理和用户信息总结

## 一、现有数据管理功能概览

### 1.1 用户数据结构

```typescript
interface User {
  id: string;              // 用户唯一ID
  email: string;           // 邮箱 (登录凭证)
  username: string;        // 用户名 (显示名称)
  password: string;        // 密码 (应存储哈希值)
  createdAt: string;       // 注册时间
}
```

### 1.2 会话管理

```typescript
interface Session {
  sessionId: string;       // 会话ID
  userId: string;          // 关联用户ID
  expiresAt: number;       // 过期时间戳
}
```

**会话策略**:
- 有效期: 7天
- 存储: `data/sessions.json`
- 自动清理过期会话

### 1.3 用户相关数据关系

```
User (用户)
  ├─ Favorites (收藏)        → data/favorites.json
  ├─ Likes (点赞)            → data/likes.json
  ├─ Bookshelf (书架)        → data/bookshelf.json
  ├─ ReadingProgress (阅读进度) → data/reading-progress.json
  ├─ UserManga (上传漫画)    → data/user-manga.json (新增)
  └─ ReviewRecords (审核记录) → data/review-records.json (新增)
```

---

## 二、用户行为数据详解

### 2.1 收藏功能 (Favorites)

**数据结构**:
```typescript
{
  [userId: string]: string[]  // userId -> mangaId[]
}
```

**操作函数**:
- `getUserFavorites(userId)` - 获取收藏列表
- `isFavorited(userId, mangaId)` - 检查是否收藏
- `addFavorite(userId, mangaId)` - 添加收藏
- `removeFavorite(userId, mangaId)` - 取消收藏
- `toggleFavorite(userId, mangaId)` - 切换收藏状态

**数据示例**:
```json
{
  "user-123": ["manga-001", "manga-002", "user-manga-456"],
  "user-456": ["manga-001", "manga-003"]
}
```

---

### 2.2 点赞功能 (Likes)

**数据结构**:
```typescript
{
  userLikes: {
    [userId: string]: string[]  // 用户点赞的漫画列表
  },
  counts: {
    [mangaId: string]: number   // 漫画点赞数
  }
}
```

**操作函数**:
- `hasUserLiked(userId, mangaId)` - 检查是否点赞
- `getMangaLikes(mangaId)` - 获取漫画点赞数
- `getUserLikedMangas(userId)` - 获取用户点赞列表
- `toggleMangaLike(userId, mangaId)` - 切换点赞状态
- `getAllMangaLikes()` - 获取所有漫画点赞数据 (用于推荐)

**数据示例**:
```json
{
  "userLikes": {
    "user-123": ["manga-001", "manga-002"],
    "user-456": ["manga-001"]
  },
  "counts": {
    "manga-001": 25,
    "manga-002": 18,
    "user-manga-456": 5
  }
}
```

---

### 2.3 书架功能 (Bookshelf)

**数据结构**:
```typescript
interface BookshelfItem {
  id: string;
  userId: string;
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  author: string;
  status: 'reading' | 'completed' | 'planned' | 'dropped';
  addedAt: string;
  updatedAt: string;
  note?: string;              // 用户笔记
}
```

**操作函数**:
- `getUserBookshelf(userId)` - 获取用户书架
- `isInBookshelf(userId, mangaId)` - 检查是否在书架
- `addToBookshelf(item)` - 添加到书架
- `removeFromBookshelf(userId, mangaId)` - 从书架移除
- `updateBookshelfStatus(userId, mangaId, status, note?)` - 更新阅读状态
- `getBookshelfStats(userId)` - 获取书架统计

**数据示例**:
```json
[
  {
    "id": "bookshelf-001",
    "userId": "user-123",
    "mangaId": "manga-001",
    "mangaTitle": "深度学习入门",
    "mangaCover": "/images/covers/manga-001.jpg",
    "author": "AI小芝士",
    "status": "reading",
    "addedAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-02T15:30:00Z",
    "note": "很棒的学习资料！"
  }
]
```

**阅读状态说明**:
- `reading` - 阅读中
- `completed` - 已读完
- `planned` - 计划阅读
- `dropped` - 放弃阅读

---

### 2.4 阅读进度 (ReadingProgress)

**数据结构**:
```typescript
interface ReadingProgress {
  id: string;
  userId: string;
  mangaId: string;
  mangaTitle: string;
  currentChapter: number;      // 当前章节
  currentPage: number;          // 当前页
  totalPages: number;           // 总页数
  progressPercentage: number;   // 进度百分比
  lastReadAt: string;           // 最后阅读时间
  isCompleted: boolean;         // 是否读完
  readTime: number;             // 阅读时长(秒)
}
```

**操作函数**:
- `getUserReadingProgress(userId)` - 获取用户所有阅读进度
- `getMangaReadingProgress(userId, mangaId)` - 获取特定漫画进度
- `updateReadingProgress(progress)` - 更新阅读进度
- `deleteReadingProgress(userId, mangaId)` - 删除阅读进度
- `getRecentReads(userId, limit?)` - 获取最近阅读

**数据示例**:
```json
[
  {
    "id": "progress-001",
    "userId": "user-123",
    "mangaId": "manga-001",
    "mangaTitle": "深度学习入门",
    "currentChapter": 2,
    "currentPage": 5,
    "totalPages": 50,
    "progressPercentage": 10,
    "lastReadAt": "2025-01-02T10:30:00Z",
    "isCompleted": false,
    "readTime": 300
  }
]
```

---

### 2.5 用户上传漫画 (UserManga) - 新增

**数据结构**:
```typescript
interface UserManga {
  id: string;
  uploaderId: string;          // 上传者ID
  title: string;
  description: string;
  coverImage: string;          // 封面图路径
  categories: string[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  chapters: UserChapter[];
}

interface UserChapter {
  id: string;
  title: string;
  pages: string[];             // 页面图片路径数组
  createdAt: string;
}
```

**操作函数**:
- `getAllUserManga()` - 获取所有用户上传
- `getUserMangaById(id)` - 根据ID获取
- `getUserMangaByUploader(uploaderId)` - 获取用户的所有上传
- `getUserMangaByStatus(status)` - 根据状态获取
- `createUserManga(manga)` - 创建上传
- `updateUserManga(id, updates)` - 更新
- `deleteUserManga(id)` - 删除
- `getPendingMangaCount()` - 待审核数量

**数据示例**:
```json
[
  {
    "id": "user-manga-001",
    "uploaderId": "user-123",
    "title": "我的AI漫画",
    "description": "这是一个关于机器学习的漫画",
    "coverImage": "/uploads/manga/user-123/user-manga-001/cover.jpg",
    "categories": ["机器学习"],
    "tags": ["入门", "科普"],
    "status": "approved",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-02T12:00:00Z",
    "views": 150,
    "likes": 25,
    "chapters": [
      {
        "id": "chapter-001",
        "title": "第1章: 什么是机器学习",
        "pages": [
          "/uploads/manga/user-123/user-manga-001/chapters/chapter-001/page-1.jpg",
          "/uploads/manga/user-123/user-manga-001/chapters/chapter-001/page-2.jpg"
        ],
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ]
  }
]
```

---

### 2.6 审核记录 (ReviewRecords) - 新增

**数据结构**:
```typescript
interface ReviewRecord {
  id: string;
  mangaId: string;             // 被审核的漫画ID
  reviewerId: string;          // 审核管理员ID
  action: 'approve' | 'reject';
  reason?: string;             // 拒绝原因
  reviewedAt: string;
}
```

**操作函数**:
- `createReviewRecord(record)` - 创建审核记录
- `getReviewRecordsByManga(mangaId)` - 获取漫画的审核记录
- `getAllReviewRecords()` - 获取所有审核记录

**数据示例**:
```json
[
  {
    "id": "review-001",
    "mangaId": "user-manga-001",
    "reviewerId": "admin-001",
    "action": "approve",
    "reason": "",
    "reviewedAt": "2025-01-02T12:00:00Z"
  },
  {
    "id": "review-002",
    "mangaId": "user-manga-002",
    "reviewerId": "admin-001",
    "action": "reject",
    "reason": "图片质量不符合要求，请提高清晰度",
    "reviewedAt": "2025-01-02T13:00:00Z"
  }
]
```

---

## 三、用户数据统计

### 3.1 个人主页统计数据

```typescript
interface UserStats {
  // 收藏相关
  favoritesCount: number;          // 收藏数量

  // 书架相关
  bookshelfTotal: number;          // 书架总数
  bookshelfReading: number;        // 阅读中
  bookshelfCompleted: number;      // 已完成
  bookshelfPlanned: number;        // 计划阅读
  bookshelfDropped: number;        // 放弃阅读

  // 上传相关 (新增)
  uploadsTotal: number;            // 上传总数
  uploadsApproved: number;         // 已通过
  uploadsPending: number;          // 待审核
  uploadsRejected: number;         // 已拒绝

  // 阅读相关
  recentReads: number;             // 最近阅读数量
  totalReadTime: number;           // 总阅读时长(秒)
}
```

### 3.2 获取用户统计

```typescript
// 从各数据文件聚合统计
function getUserStats(userId: string): UserStats {
  const favorites = getUserFavorites(userId);
  const bookshelf = getUserBookshelf(userId);
  const bookshelfStats = getBookshelfStats(userId);
  const uploads = getUserMangaByUploader(userId);
  const readingProgress = getUserReadingProgress(userId);

  return {
    favoritesCount: favorites.length,
    bookshelfTotal: bookshelf.length,
    bookshelfReading: bookshelfStats.reading,
    bookshelfCompleted: bookshelfStats.completed,
    bookshelfPlanned: bookshelfStats.planned,
    bookshelfDropped: bookshelfStats.dropped,
    uploadsTotal: uploads.length,
    uploadsApproved: uploads.filter(u => u.status === 'approved').length,
    uploadsPending: uploads.filter(u => u.status === 'pending').length,
    uploadsRejected: uploads.filter(u => u.status === 'rejected').length,
    recentReads: readingProgress.length,
    totalReadTime: readingProgress.reduce((sum, p) => sum + p.readTime, 0),
  };
}
```

---

## 四、数据文件总览

### 4.1 数据文件清单

```
data/
├── users.json                    # 用户账号信息
├── sessions.json                 # 会话管理
├── favorites.json                # 收藏数据
├── likes.json                    # 点赞数据
├── bookshelf.json                # 书架数据
├── reading-progress.json         # 阅读进度
├── user-manga.json               # 用户上传漫画 (新增)
├── review-records.json           # 审核记录 (新增)
└── comments.json                 # 评论数据
```

### 4.2 数据文件用途说明

| 文件 | 用途 | 结构 | 访问频率 |
|-----|------|------|---------|
| `users.json` | 用户注册/登录 | `User[]` | 高 |
| `sessions.json` | 会话管理 | `{[sessionId]: Session}` | 高 |
| `favorites.json` | 收藏功能 | `{[userId]: mangaId[]}` | 中 |
| `likes.json` | 点赞功能 | `{userLikes, counts}` | 高 |
| `bookshelf.json` | 书架管理 | `BookshelfItem[]` | 中 |
| `reading-progress.json` | 阅读进度 | `ReadingProgress[]` | 高 |
| `user-manga.json` | 用户上传 | `UserManga[]` | 中 |
| `review-records.json` | 审核记录 | `ReviewRecord[]` | 低 |
| `comments.json` | 评论功能 | `{[commentId]: Comment}` | 中 |

---

## 五、用户隐私与安全

### 5.1 敏感数据保护

**密码存储**:
```typescript
// ❌ 错误: 明文存储
password: "123456"

// ✅ 正确: 哈希存储 (需实现)
passwordHash: bcrypt.hash("123456", 10)
```

**会话安全**:
- 使用HttpOnly Cookie
- 设置Secure标志 (HTTPS)
- 7天自动过期
- 服务端验证

### 5.2 数据访问控制

```typescript
// 示例: 只能访问自己的数据
export async function GET(request: NextRequest) {
  const userId = getSessionUserId(sessionCookie);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 只获取该用户的数据
  const favorites = getUserFavorites(userId);
  const bookshelf = getUserBookshelf(userId);

  return NextResponse.json({ favorites, bookshelf });
}
```

### 5.3 数据最小化原则

**用户信息显示**:
- ✅ 显示: 用户名、头像、注册时间
- ❌ 隐藏: 邮箱、密码、会话ID

**隐私设置** (建议扩展):
```typescript
interface PrivacySettings {
  showFavorites: boolean;        // 显示收藏
  showBookshelf: boolean;        // 显示书架
  showReadingProgress: boolean;  // 显示阅读进度
  showUploads: boolean;          // 显示上传
  allowMessages: boolean;        // 允许私信
}
```

---

## 六、数据备份与恢复

### 6.1 备份策略

**自动备份** (建议实现):
```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"
DATA_DIR="/path/to/manga-reader/data"

tar -czf $BACKUP_DIR/data-$DATE.tar.gz $DATA_DIR

# 保留最近30天
find $BACKUP_DIR -name "data-*.tar.gz" -mtime +30 -delete
```

### 6.2 数据迁移

**从旧版本迁移**:
```typescript
// 示例: 添加新字段
function migrateUserMangaData() {
  const data = readUserMangaData();

  // 为旧数据添加缺失字段
  const migrated = data.map(manga => ({
    ...manga,
    views: manga.views || 0,
    likes: manga.likes || 0,
  }));

  saveUserMangaData(migrated);
}
```

---

## 七、数据清理策略

### 7.1 定期清理任务

**会话清理** (已实现):
- 每次读取时自动清理过期会话

**建议扩展**:
- 90天未登录的用户标记为"非活跃"
- 180天未登录的用户发送通知
- 365天未登录的用户归档数据

### 7.2 软删除 vs 硬删除

**软删除** (推荐):
```typescript
interface UserManga {
  // ...
  isDeleted: boolean;          // 软删除标记
  deletedAt?: string;          // 删除时间
}

function deleteUserManga(id: string) {
  // 不真正删除，只标记
  updateUserManga(id, {
    isDeleted: true,
    deletedAt: new Date().toISOString()
  });
}
```

**硬删除** (谨慎使用):
- 管理员手动删除
- 违规内容删除
- 需同时删除关联文件

---

## 八、性能优化建议

### 8.1 数据索引

```typescript
// 建议添加内存索引加速查询
const userMangaIndex = {
  byUploader: new Map<string, UserManga[]>(),
  byStatus: new Map<string, UserManga[]>(),
  byCategory: new Map<string, UserManga[]>(),
};

function buildIndex() {
  const all = getAllUserManga();
  all.forEach(manga => {
    // 按上传者索引
    if (!userMangaIndex.byUploader.has(manga.uploaderId)) {
      userMangaIndex.byUploader.set(manga.uploaderId, []);
    }
    userMangaIndex.byUploader.get(manga.uploaderId)!.push(manga);

    // 按状态索引
    if (!userMangaIndex.byStatus.has(manga.status)) {
      userMangaIndex.byStatus.set(manga.status, []);
    }
    userMangaIndex.byStatus.get(manga.status)!.push(manga);
  });
}
```

### 8.2 分页加载

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function getPaginatedUserManga(
  uploaderId: string,
  { page, pageSize }: PaginationParams
): PaginatedResult<UserManga> {
  const all = getUserMangaByUploader(uploaderId);
  const total = all.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = all.slice(start, end);

  return {
    data,
    total,
    page,
    pageSize,
    hasMore: end < total,
  };
}
```

---

## 九、监控与统计

### 9.1 全局统计

```typescript
interface GlobalStats {
  // 用户统计
  totalUsers: number;
  activeUsers: number;          // 7日内活跃
  newUsersToday: number;
  newUsersThisWeek: number;

  // 内容统计
  totalManga: number;           // 官方漫画
  totalUserManga: number;       // 用户上传
  pendingReview: number;        // 待审核

  // 交互统计
  totalFavorites: number;
  totalLikes: number;
  totalViews: number;
}
```

### 9.2 用户活跃度

```typescript
interface UserActivity {
  userId: string;
  lastLoginAt: string;
  loginDays: number;            // 登录天数
  actionsCount: number;         // 操作次数(收藏、点赞等)
  uploadCount: number;          // 上传次数
  commentCount: number;         // 评论次数
}
```

---

## 十、总结

### 核心数据文件

| 功能 | 数据文件 | 主要操作 |
|-----|---------|---------|
| 用户认证 | `users.json`, `sessions.json` | 注册、登录、登出 |
| 内容消费 | `favorites.json`, `likes.json`, `bookshelf.json` | 收藏、点赞、书架 |
| 阅读记录 | `reading-progress.json` | 进度追踪、历史记录 |
| **内容生产** | **`user-manga.json`** | **上传、编辑、删除** |
| **内容审核** | **`review-records.json`** | **审核、记录** |
| 社交互动 | `comments.json` | 评论、回复 |

### 数据流向

```
用户行为 → API → 数据验证 → 数据存储 → 响应返回
   ↓
触发关联操作:
- 上传漫画 → 创建审核记录 → 通知管理员
- 审核通过 → 更新状态 → 显示在首页
- 点赞/收藏 → 更新计数 → 影响推荐
```

### 下一步优化

1. **实现密码哈希**: 使用bcrypt
2. **添加数据验证**: Zod schema
3. **实现分页**: 所有列表API
4. **添加缓存**: Redis或内存缓存
5. **数据加密**: 敏感信息加密存储
6. **审计日志**: 记录所有关键操作

---

**文档版本**: v1.0
**创建日期**: 2025-01-02
**作者**: AI Product Team
