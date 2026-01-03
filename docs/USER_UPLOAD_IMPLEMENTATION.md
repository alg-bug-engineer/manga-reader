# 用户上传漫画功能 - 实现总结

## 已完成的工作

### 1. 数据存储层扩展 ✅

已完成 `lib/storage.ts` 的扩展，新增以下功能：

#### 类型定义
```typescript
export interface UserChapter {
  id: string;
  title: string;
  pages: string[];
  createdAt: string;
}

export interface UserManga {
  id: string;
  uploaderId: string;
  title: string;
  description: string;
  coverImage: string;
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

export interface ReviewRecord {
  id: string;
  mangaId: string;
  reviewerId: string;
  action: 'approve' | 'reject';
  reason?: string;
  reviewedAt: string;
}
```

#### 数据操作函数
- ✅ `getAllUserManga()` - 获取所有用户上传漫画
- ✅ `getUserMangaById(id)` - 根据ID获取漫画
- ✅ `getUserMangaByUploader(uploaderId)` - 获取用户的所有上传
- ✅ `getUserMangaByStatus(status)` - 根据状态获取漫画
- ✅ `createUserManga(manga)` - 创建用户上传漫画
- ✅ `updateUserManga(id, updates)` - 更新漫画信息
- ✅ `deleteUserManga(id)` - 删除漫画
- ✅ `getPendingMangaCount()` - 获取待审核数量
- ✅ `createReviewRecord(record)` - 创建审核记录
- ✅ `getReviewRecordsByManga(mangaId)` - 获取漫画的审核记录
- ✅ `getAllReviewRecords()` - 获取所有审核记录

---

## 待实现功能清单

### 2. API路由开发

#### 2.1 用户上传相关API

**文件结构**:
```
app/api/user/manga/
├── route.ts                    # 获取列表、上传
├── [id]/
│   ├── route.ts                # 获取详情、更新、删除
│   └── submit/
│       └── route.ts            # 提交审核
```

**需要实现的API**:

1. **GET /api/user/manga** - 获取我的上传列表
   ```typescript
   // 查询参数:
   // - status?: 'pending' | 'approved' | 'rejected'
   // 返回:
   { success: true; mangas: UserManga[] }
   ```

2. **POST /api/user/manga** - 上传漫画
   ```typescript
   // 请求体:
   {
     title: string;
     description: string;
     coverImage: string;
     categories: string[];
     tags: string[];
     chapters: UserChapter[];
   }
   // 返回:
   { success: true; manga: UserManga }
   ```

3. **GET /api/user/manga/[id]** - 获取漫画详情
   ```typescript
   // 返回:
   { success: true; manga: UserManga }
   ```

4. **PUT /api/user/manga/[id]** - 编辑漫画
   ```typescript
   // 请求体: Partial<UserManga>
   // 返回:
   { success: true; manga: UserManga }
   ```

5. **DELETE /api/user/manga/[id]** - 删除漫画
   ```typescript
   // 返回:
   { success: true }
   ```

6. **POST /api/user/manga/[id]/submit** - 提交审核
   ```typescript
   // 返回:
   { success: true; manga: UserManga }
   ```

#### 2.2 管理员审核相关API

**文件结构**:
```
app/api/admin/
├── pending-manga/
│   └── route.ts                # 获取待审核列表
├── manga/
│   └── [id]/
│       └── review/
│           └── route.ts        # 审核漫画
└── review-history/
    └── route.ts                # 审核历史
```

**需要实现的API**:

1. **GET /api/admin/pending-manga** - 获取待审核列表
   ```typescript
   // 返回:
   { success: true; mangas: UserManga[]; count: number }
   ```

2. **POST /api/admin/manga/[id]/review** - 审核漫画
   ```typescript
   // 请求体:
   {
     action: 'approve' | 'reject';
     reason?: string;
   }
   // 返回:
   { success: true; manga: UserManga; record: ReviewRecord }
   ```

3. **GET /api/admin/review-history** - 审核历史
   ```typescript
   // 查询参数:
   // - mangaId?: string
   // - limit?: number
   // 返回:
   { success: true; records: ReviewRecord[] }
   ```

#### 2.3 文件上传API

**文件结构**:
```
app/api/upload/
├── cover/
│   └── route.ts                # 上传封面
└── pages/
    └── route.ts                # 上传页面图片
```

**需要实现的API**:

1. **POST /api/upload/cover** - 上传封面
   ```typescript
   // 请求: FormData { file: File }
   // 返回:
   { success: true; path: string; url: string }
   ```

2. **POST /api/upload/pages** - 上传页面图片
   ```typescript
   // 请求: FormData { files: File[] }
   // 返回:
   { success: true; paths: string[]; urls: string[] }
   ```

**文件存储规则**:
```
public/uploads/
└── manga/
    └── [userId]/
        └── [mangaId]/
            ├── cover.jpg
            └── chapters/
                └── [chapterId]/
                    ├── page-1.jpg
                    ├── page-2.jpg
                    └── ...
```

---

### 3. 前端UI组件开发

#### 3.1 个人中心页面升级

**文件**: `app/profile/page.tsx` (新建)

**功能**:
- Tab切换: [我的上传] [我的收藏] [个人信息]
- 我的上传列表展示
- 状态筛选: [全部] [待审核] [已通过] [已拒绝]
- 上传新漫画按钮

**状态标识设计**:
```
待审核: 🟡 黄色标签 "审核中"
已通过: 🟢 绿色标签 "已上架"
已拒绝: 🔴 红色标签 "未通过"
```

#### 3.2 上传页面

**文件**: `app/upload/page.tsx` (新建)

**功能**:
- 步骤式表单:
  1. 填写基本信息 (标题、描述、分类、标签)
  2. 上传封面图 (预览)
  3. 创建章节
  4. 上传章节页面图片 (支持拖拽排序)
  5. 确认并提交

**组件**:
- `UploadForm` - 上传表单主组件
- `CoverUpload` - 封面上传组件
- `ChapterEditor` - 章节编辑器
- `PageUploader` - 页面上传器 (支持拖拽排序)

#### 3.3 管理员审核页面

**文件**: `app/admin/review/page.tsx` (新建)

**功能**:
- 待审核漫画列表
- 漫画详情查看
- 审核操作: [通过] [拒绝]
- 拒绝原因输入
- 审核历史记录

**布局**:
```
┌─────────────────────────────────────┐
│ 待审核 (5)                           │
├─────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐          │
│ │ 漫画卡片  │ │ 漫画卡片  │          │
│ │ [通过][拒绝] │                    │
│ └──────────┘ └──────────┘          │
└─────────────────────────────────────┘
```

#### 3.4 用户上传漫画卡片组件

**文件**: `components/manga/UserMangaCard.tsx` (新建)

**功能**:
- 显示封面、标题、作者
- 状态标签
- 操作按钮: [编辑] [删除] [查看详情]
- 统计信息: 浏览量、点赞数

---

### 4. 现有功能集成

#### 4.1 首页集成

**修改**: `app/page.tsx`

**新增**:
- API调用时合并 `data/local.json` 和 `data/user-manga.json`
- 只显示 `status === 'approved'` 的用户上传漫画
- 卡片上标识来源: [官方] 或 [UGC]

#### 4.2 搜索功能集成

**修改**: `components/ui/SearchBar.tsx` 或相关搜索逻辑

**新增**:
- 搜索用户上传漫画
- 过滤只搜索已审核通过的漫画

#### 4.3 用户主页集成

**修改**: `app/user/[id]/page.tsx`

**新增**:
- Tab: [收藏] [上传] [关于]
- 上传列表展示 (只显示已通过的)
- 上传数量统计

---

### 5. 数据管理页面

#### 5.1 管理员仪表盘升级

**修改**: `app/admin/page.tsx`

**新增统计卡片**:
- 待审核漫画数量
- 用户上传总数
- 今日上传数
- 本周上传数

**新增快捷操作**:
- 审核待审漫画
- 管理用户上传
- 查看审核历史

#### 5.2 数据管理页面

**文件**: `app/admin/data/page.tsx` (新建)

**功能**:
- 用户列表
- 用户上传列表
- 审核记录
- 数据导出 (CSV/JSON)

---

### 6. 文件上传组件开发

#### 6.1 ImageUpload组件

**文件**: `components/upload/ImageUpload.tsx` (新建)

**功能**:
- 拖拽上传
- 点击上传
- 图片预览
- 上传进度
- 文件大小限制 (<2MB)
- 格式验证 (jpg, png, webp)

**Props**:
```typescript
interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  maxSize?: number;
  accept?: string;
  value?: string;
  onChange?: (url: string) => void;
}
```

#### 6.2 MultiImageUpload组件

**文件**: `components/upload/MultiImageUpload.tsx` (新建)

**功能**:
- 多文件选择
- 拖拽排序
- 批量上传
- 进度显示
- 删除单个图片

**Props**:
```typescript
interface MultiImageUploadProps {
  onUpload: (files: File[]) => Promise<string[]>;
  maxSize?: number;
  maxCount?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
}
```

---

## 实施优先级

### P0 - 核心功能 (必须)

1. ✅ 数据存储层
2. 🔲 API路由开发
   - `/api/user/manga/*`
   - `/api/upload/*`
3. 🔲 上传页面UI
4. 🔲 个人中心升级

### P1 - 管理功能 (重要)

5. 🔲 管理员审核页面
6. 🔲 管理员仪表盘升级
7. 🔲 用户上传漫画详情页

### P2 - 增强功能 (可选)

8. 🔲 首页集成用户上传
9. 🔲 搜索功能扩展
10. 🔲 数据管理页面

---

## 技术要点

### 文件上传处理

```typescript
// 示例: 上传封面
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' });
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Invalid file type' });
  }

  // 验证文件大小 (<2MB)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'File too large' });
  }

  // 生成文件路径
  const userId = 'user-id'; // 从session获取
  const mangaId = 'manga-id'; // 从请求参数获取
  const fileName = `cover-${Date.now()}.jpg`;
  const relativePath = `/uploads/manga/${userId}/${mangaId}/${fileName}`;
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  // 确保目录存在
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  // 保存文件
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);

  return NextResponse.json({
    success: true,
    path: relativePath,
    url: relativePath,
  });
}
```

### 权限控制

```typescript
// 示例: 验证用户权限
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userId = getSessionUserId(sessionCookie.value);

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }

  // 继续处理请求...
}
```

### 状态管理

```typescript
// 示例: 审核状态流转
pending -> (审核通过) -> approved -> (显示在首页)
pending -> (审核拒绝) -> rejected -> (可修改重新提交)
```

---

## 数据流图

```
用户上传漫画流程:

[用户] → [上传页面] → [API: POST /api/user/manga]
                            ↓
                       [创建 UserManga]
                       [status: 'pending']
                            ↓
                       [保存到 user-manga.json]
                            ↓
                       [通知管理员]
                            ↓
[管理员] → [审核页面] → [API: GET /api/admin/pending-manga]
                            ↓
                       [查看待审核列表]
                            ↓
                [API: POST /api/admin/manga/[id]/review]
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
        [action: approve]            [action: reject]
              ↓                           ↓
        [status: 'approved']         [status: 'rejected']
              ↓                           ↓
        [显示在首页]                [返回修改理由]
```

---

## 测试清单

- ✅ 数据存储层函数测试
- 🔲 API路由单元测试
- 🔲 文件上传功能测试
- 🔲 审核流程测试
- 🔲 权限控制测试
- 🔲 前端组件集成测试

---

## 已创建的文档

1. ✅ `docs/USER_UPLOAD_DESIGN.md` - 设计文档
2. ✅ `docs/VIDEO_FEATURE_PRD.md` - 视频功能PRD (之前创建)
3. ✅ `lib/storage.ts` - 数据存储层 (已扩展)
4. ✅ `docs/USER_UPLOAD_IMPLEMENTATION.md` - 本文档

---

## 下一步行动

### 立即开始 (今天)

1. 创建文件上传API (`/api/upload/cover`, `/api/upload/pages`)
2. 创建用户上传API (`/api/user/manga/*`)
3. 创建上传页面UI组件

### 本周完成

4. 实现管理员审核功能
5. 升级个人中心页面
6. 集成到首页和搜索

### 下周优化

7. 添加更多UI细节和交互
8. 性能优化
9. 测试和bug修复

---

**文档版本**: v1.0
**创建日期**: 2025-01-02
**最后更新**: 2025-01-02
