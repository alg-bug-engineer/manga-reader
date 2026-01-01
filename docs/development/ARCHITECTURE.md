# Manga-Reader 项目架构文档

> **版本**: v1.0
> **更新日期**: 2025-12-30
> **维护者**: 开发团队

---

## 📑 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 项目结构](#3-项目结构)
- [4. 目录说明](#4-目录说明)
- [5. 核心模块](#5-核心模块)
- [6. 数据流](#6-数据流)
- [7. 架构设计原则](#7-架构设计原则)
- [8. 扩展指南](#8-扩展指南)

---

## 1. 项目概述

Manga-Reader 是一个基于 Next.js 16 的 AI 知识科普漫画阅读平台，采用最新的 App Router 架构和 React 19，提供卓越的用户体验和开发体验。

### 1.1 核心特性

- 🎨 **现代设计系统**: Dify 风格 + 终端绿主题
- 📱 **完美响应式**: 移动端优先设计
- 🌓 **双主题支持**: 亮色/暗色模式无缝切换
- ⚡ **性能优化**: 预加载、懒加载、骨架屏
- 🔐 **认证系统**: Cookie-based Session
- 💬 **互动功能**: 收藏、点赞、评论

### 1.2 技术亮点

- **Next.js 16 App Router**: Server Components + RSC
- **React 19**: 最新特性和性能优化
- **TypeScript 5**: 完整类型安全
- **TailwindCSS 4**: 实用工具优先的 CSS 框架
- **文件系统数据**: 零配置启动

---

## 2. 技术栈

### 2.1 前端框架

```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "typescript": "5.x"
}
```

### 2.2 样式方案

```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "postcss": "^8"
}
```

### 2.3 字体系统

- **Manrope**: 英文正文（Google Fonts）
- **Outfit**: 英文标题（Google Fonts）
- **Noto Sans SC**: 中文（Google Fonts）
- **JetBrains Mono**: 代码（Google Fonts）

### 2.4 开发工具

```json
{
  "eslint": "^9",
  "eslint-config-next": "16.1.1"
}
```

---

## 3. 项目结构

### 3.1 整体结构

```
manga-reader/
├── app/                    # Next.js App Router (应用主目录)
│   ├── api/               # API 路由
│   ├── manga/             # 漫画详情页
│   ├── read/              # 阅读器页面
│   ├── user/              # 用户中心
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
│
├── components/            # React 组件 (按功能分类)
│   ├── layout/           # 布局组件
│   ├── manga/            # 漫画相关组件
│   ├── ui/               # UI 组件
│   └── feedback/         # 反馈组件
│
├── lib/                  # 核心逻辑库
│   ├── contexts/        # React Context
│   ├── hooks/           # 自定义 Hooks
│   ├── scanner.ts       # 文件系统扫描器
│   ├── storage.ts       # 数据存储管理
│   └── data.ts          # 示例数据和工具
│
├── types/               # TypeScript 类型定义
│   └── manga.ts        # 漫画相关类型
│
├── data/                # 本地数据存储
│   ├── users.json      # 用户数据
│   ├── sessions.json   # 会话数据
│   ├── favorites.json  # 收藏数据
│   ├── likes.json      # 点赞数据
│   ├── views.json      # 浏览量数据
│   └── comments.json   # 评论数据
│
├── docs/                # 项目文档
│   ├── product/        # 产品文档
│   ├── development/    # 开发文档
│   ├── design/         # 设计文档
│   ├── deployment/     # 部署文档
│   └── api/            # API 文档
│
├── public/             # 静态资源
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── 配置文件
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── eslint.config.mjs
    └── postcss.config.mjs
```

---

## 4. 目录说明

### 4.1 `app/` - Next.js App Router

#### 路由结构

```
app/
├── api/                           # API 路由
│   ├── auth/                     # 认证 API
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── logout/route.ts
│   │   ├── me/route.ts
│   │   └── reset-password/
│   │
│   ├── manga/                    # 漫画 API
│   │   ├── local/route.ts       # 获取本地扫描数据
│   │   └── [id]/
│   │       ├── route.ts         # 获取单个漫画
│   │       ├── view/route.ts    # 浏览量统计
│   │       └── like/route.ts    # 点赞切换
│   │
│   ├── chapter/                  # 章节 API
│   │   └── [id]/route.ts
│   │
│   ├── comments/                 # 评论 API
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── like/route.ts
│   │
│   ├── favorites/                # 收藏 API
│   │   ├── check/route.ts
│   │   ├── route.ts
│   │   └── toggle/route.ts
│   │
│   ├── images/                   # 图片服务 API
│   │   └── [...path]/route.ts
│   │
│   ├── stats/                    # 统计 API
│   │   └── route.ts
│   │
│   └── user/                     # 用户 API
│       └── [id]/route.ts
│
├── manga/[id]/                   # 漫画详情页
│   └── page.tsx
│
├── read/[id]/                    # 阅读器页面
│   └── page.tsx
│
├── user/[id]/                    # 用户中心
│   └── page.tsx
│
├── layout.tsx                    # 根布局
├── page.tsx                      # 首页
└── globals.css                   # 全局样式
```

#### 文件说明

| 文件 | 说明 |
|------|------|
| `layout.tsx` | 根布局，包含主题、Toast、认证三个 Provider |
| `page.tsx` | 首页，包含 Hero、搜索、筛选、漫画网格 |
| `globals.css` | 全局样式，定义 CSS 变量和设计系统 |
| `page-local.tsx` | 本地数据版本首页（备用） |

---

### 4.2 `components/` - React 组件

#### 组件分类（已优化）

```
components/
├── layout/                      # 布局组件 (1个)
│   └── Navbar.tsx              # 导航栏
│
├── manga/                       # 漫画组件 (3个)
│   ├── MangaCard.tsx           # 漫画卡片
│   ├── MangaCardSkeleton.tsx   # 漫画卡片骨架屏
│   └── ProtectedImage.tsx      # 受保护图片组件
│
├── ui/                          # UI 组件 (4个)
│   ├── SearchBar.tsx           # 搜索栏
│   ├── SortOptions.tsx         # 排序选项
│   ├── ThemeToggle.tsx         # 主题切换
│   └── Skeleton.tsx            # 通用骨架屏
│
└── feedback/                    # 反馈组件 (2个)
    ├── AuthModal.tsx           # 认证弹窗
    └── CommentSidebar.tsx      # 评论侧边栏
```

#### 组件说明

**布局组件**:
- `Navbar.tsx`: 顶部导航栏，支持移动端汉堡菜单

**漫画组件**:
- `MangaCard.tsx`: 漫画卡片，显示封面、标题、作者、标签、浏览量、点赞
- `MangaCardSkeleton.tsx`: 漫画卡片加载骨架屏
- `ProtectedImage.tsx`: 受保护的图片组件（禁用右键和拖拽）

**UI 组件**:
- `SearchBar.tsx`: 搜索框，支持实时搜索
- `SortOptions.tsx`: 排序选择器（最新、人气、浏览、点赞）
- `ThemeToggle.tsx`: 主题切换按钮（亮色/暗色）
- `Skeleton.tsx`: 通用骨架屏组件

**反馈组件**:
- `AuthModal.tsx`: 登录/注册弹窗
- `CommentSidebar.tsx`: 评论侧边栏

---

### 4.3 `lib/` - 核心逻辑库

```
lib/
├── contexts/                    # React Context (3个)
│   ├── AuthContext.tsx         # 认证上下文
│   ├── ThemeContext.tsx        # 主题上下文
│   └── ToastContext.tsx        # Toast 通知上下文
│
├── hooks/                       # 自定义 Hooks (3个)
│   ├── useMangaData.ts         # 获取漫画列表
│   ├── useMangaById.ts         # 获取单个漫画
│   └── useChapterById.ts       # 获取章节详情
│
├── scanner.ts                   # 文件系统扫描器 (277行)
├── storage.ts                   # 数据存储管理 (422行)
└── data.ts                      # 示例数据和工具 (301行)
```

#### Context 层级

```
ThemeProvider (主题)
  └─ ToastProvider (通知)
      └─ AuthProvider (认证)
          └─ App Pages
```

#### Hooks 说明

| Hook | 说明 | 返回值 |
|------|------|--------|
| `useMangaData()` | 获取漫画列表 | `{ mangaList, loading, error, rawData }` |
| `useMangaById(id)` | 获取单个漫画 | `{ manga, loading, error }` |
| `useChapterById(id)` | 获取章节详情 | `{ chapter, loading, error }` |

---

### 4.4 `types/` - 类型定义

```typescript
// types/manga.ts (45行)

export interface Manga {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: string[];
  tags: string[];
  updateTime: string;
  views: number;
  likes: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  pages: string[];
  updateTime: string;
}

export interface MangaListItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: string[];
  tags: string[];
  latestChapter: string;
  updateTime: string;
  views: number;
  likes: number;
}

export type ReaderMode = 'strip' | 'page' | 'double-page';
```

---

### 4.5 `data/` - 数据存储

```
data/
├── users.json                # 用户数据
├── sessions.json             # 会话数据 (7天有效期)
├── favorites.json            # 收藏关系
├── likes.json                # 点赞数据
├── views.json                # 浏览量统计
├── comments.json             # 评论数据
│
└── [漫画系列]/               # 漫画图片文件夹
    └── [章节]/
        ├── 封面.png
        ├── 1.png
        ├── 2.png
        └── ...
```

#### 数据结构

**users.json**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "用户名",
      "password": "明文密码（待加密）",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**sessions.json**:
```json
{
  "sessions": [
    {
      "token": "uuid",
      "userId": "uuid",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "expiresAt": "2025-01-08T00:00:00.000Z"
    }
  ]
}
```

**favorites.json**:
```json
{
  "favorites": [
    {
      "userId": "uuid",
      "mangaId": "uuid",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 5. 核心模块

### 5.1 文件系统扫描器 (`lib/scanner.ts`)

**功能**: 自动扫描 `data/` 目录，生成漫画数据

**支持的数据组织方式**:

1. **多章节模式**:
   ```
   data/
   └── 漫画系列/
       ├── 封面.png
       └── 第1话/
           ├── 1.png
           ├── 2.png
           └── ...
   ```

2. **单章节模式**:
   ```
   data/
   └── 漫画系列/
       ├── 封面.png
       ├── 1.png
       ├── 2.png
       └── ...
   ```

**智能排序**:
- 封面.png → 数字排序 → 字母排序

**自动生成**:
- 浏览量、点赞数、标签（基于目录结构）

---

### 5.2 数据存储管理 (`lib/storage.ts`)

**功能**: 统一管理 JSON 文件读写

**核心方法**:

```typescript
// 用户管理
createUser(email, username, password)
getUserByEmail(email)
getUserById(id)

// 会话管理
createSession(userId)
getSession(token)
deleteSession(token)

// 收藏管理
addFavorite(userId, mangaId)
removeFavorite(userId, mangaId)
checkFavorite(userId, mangaId)

// 点赞管理
toggleLike(mangaId, userId)
checkLike(mangaId, userId)

// 浏览量管理
incrementViews(mangaId)

// 评论管理
createComment(mangaId, userId, content)
getCommentsByMangaId(mangaId)
toggleCommentLike(commentId, userId)
```

---

### 5.3 认证系统 (`lib/contexts/AuthContext.tsx`)

**认证方式**: Cookie-based Session

**流程**:

```
1. 用户登录
   ↓
2. 验证邮箱和密码
   ↓
3. 创建 Session (7天有效期)
   ↓
4. 设置 Cookie (httpOnly, secure, sameSite=lax)
   ↓
5. 返回用户信息
```

**安全性**:
- ✅ Session 存储（无状态）
- ✅ HttpOnly Cookie（防止 XSS）
- ✅ Secure 标志（HTTPS）
- ✅ SameSite=Lax（防止 CSRF）
- ⚠️ 密码明文存储（待改进为 bcrypt）

---

## 6. 数据流

### 6.1 首页数据流

```
用户访问首页
  ↓
useMangaData Hook
  ↓
GET /api/manga/local
  ↓
scanner.ts 扫描 data/ 目录
  ↓
返回漫画列表
  ↓
用户筛选/排序
  ↓
前端过滤排序 (useMemo)
  ↓
渲染漫画网格
```

### 6.2 阅读器数据流

```
用户点击章节
  ↓
导航到 /read/[chapterId]
  ↓
useChapterById Hook
  ↓
GET /api/chapter/[id]
  ↓
storage.ts 读取章节信息
  ↓
返回章节详情（包含图片URL列表）
  ↓
阅读器组件
  ↓
图片预加载（前后2-4页）
  ↓
渲染当前页
```

### 6.3 认证数据流

```
用户登录
  ↓
POST /api/auth/login
  ↓
storage.ts 验证用户
  ↓
创建 Session
  ↓
设置 Cookie
  ↓
AuthContext 更新状态
  ↓
全局状态同步
```

---

## 7. 架构设计原则

### 7.1 分层架构

```
┌─────────────────────────────────────┐
│      Presentation Layer (UI)        │  ← components/
│  - React Components                 │
│  - UI Components                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Business Logic Layer          │  ← lib/hooks/, lib/contexts/
│  - Custom Hooks                     │
│  - Context API                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Access Layer             │  ← lib/storage.ts, lib/scanner.ts
│  - Data Storage                     │
│  - File Scanner                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Layer                     │  ← data/, JSON files
│  - JSON Files                       │
│  - File System                      │
└─────────────────────────────────────┘
```

### 7.2 设计模式

1. **Provider Pattern**: Context API 全局状态管理
2. **Custom Hooks Pattern**: 业务逻辑封装
3. **Repository Pattern**: `storage.ts` 统一数据访问
4. **Factory Pattern**: `scanner.ts` 动态生成漫画对象
5. **Observer Pattern**: React Hooks 自动更新

### 7.3 关键设计决策

| 决策 | 理由 | 优势 |
|------|------|------|
| **App Router** | Next.js 16 默认 | RSC、流式渲染、更好的性能 |
| **JSON 文件存储** | 零配置启动 | 无需数据库、易于部署、适合小型项目 |
| **Cookie Session** | 无状态认证 | 安全、可扩展、符合 RESTful |
| **CSS Variables** | 设计系统 | 主题切换、类型安全、一致性 |
| **TypeScript** | 类型安全 | 减少错误、IDE 支持、可维护性 |

---

## 8. 扩展指南

### 8.1 添加新页面

```bash
# 1. 创建页面文件
app/new-page/page.tsx

# 2. 实现页面组件
export default function NewPage() {
  return <div>新页面</div>
}

# 3. 访问 /new-page
```

### 8.2 添加新 API

```bash
# 1. 创建 API 路由
app/api/endpoint/route.ts

# 2. 实现处理器
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, data: [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ success: true })
}
```

### 8.3 添加新组件

```bash
# 1. 创建组件文件
components/category/ComponentName.tsx

# 2. 实现组件
export default function ComponentName() {
  return <div>组件内容</div>
}

# 3. 导入使用
import ComponentName from '@/components/category/ComponentName'
```

### 8.4 添加新的数据字段

```typescript
// 1. 更新类型定义
// types/manga.ts
export interface Manga {
  // ... 现有字段
  newField: string  // 添加新字段
}

// 2. 更新 scanner.ts
function createManga(dirName: string, files: string[]): Manga {
  return {
    // ... 现有字段
    newField: '默认值'  // 添加新字段初始化
  }
}

// 3. 更新 storage.ts（如果需要持久化）
```

### 8.5 切换到数据库

```typescript
// 1. 安装 ORM
npm install prisma

// 2. 初始化 Prisma
npx prisma init

// 3. 定义 Schema
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String
  password  String
  createdAt DateTime @default(now())
}

// 4. 迁移数据库
npx prisma migrate dev

// 5. 替换 storage.ts 中的 JSON 文件操作为 Prisma 调用
```

---

## 附录

### A. 环境变量

目前项目不需要环境变量，所有配置都在代码中。

如果需要添加：

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://...
```

### B. 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### C. 依赖安装

```bash
# 安装新依赖
npm install package-name

# 安装开发依赖
npm install -D package-name

# 更新依赖
npm update
```

### D. 性能监控建议

建议集成：
- **Vercel Analytics**: 页面访问统计
- **Sentry**: 错误追踪
- **Lighthouse CI**: 性能监控

---

**文档版本**: v1.0
**最后更新**: 2025-12-30
**维护者**: 开发团队
