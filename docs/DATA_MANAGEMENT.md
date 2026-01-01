# 漫画数据管理系统使用说明

## 📁 数据文件

所有漫画数据存储在 `data/manga.json` 文件中，包含以下信息：

- 漫画基本信息（标题、作者、简介、封面图等）
- 分类和标签
- 章节列表和页面图片
- 状态、浏览量、点赞数等统计数据

## 🔌 API 接口

### 1. 漫画管理接口

#### 获取所有漫画列表
```
GET /api/manga
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "大语言模型入门",
      "author": "AI科普团队",
      "coverImage": "...",
      "status": "ongoing",
      "categories": ["大模型", "NLP"],
      "tags": ["入门", "科普"],
      "latestChapter": "第2话：...",
      "updateTime": "2025-12-29",
      "views": 28560,
      "likes": 0
    }
  ],
  "total": 6
}
```

#### 获取单个漫画详情
```
GET /api/manga?id=1
```

#### 创建新漫画
```
POST /api/manga
Content-Type: application/json

{
  "title": "新漫画标题",
  "author": "作者名",
  "description": "简介",
  "coverImage": "https://...",
  "status": "ongoing",
  "categories": ["NLP", "深度学习"],
  "tags": ["入门", "科普"],
  "chapters": []
}
```

#### 更新漫画
```
PUT /api/manga
Content-Type: application/json

{
  "id": "1",
  "title": "更新后的标题",
  "author": "作者名",
  "description": "更新后的简介",
  "coverImage": "https://...",
  "status": "completed",
  "categories": ["NLP"],
  "tags": ["入门", "科普", "热门"]
}
```

#### 删除漫画
```
DELETE /api/manga?id=1
```

### 2. 章节管理接口

#### 获取漫画的所有章节
```
GET /api/manga/1/chapters
```

#### 添加新章节
```
POST /api/manga/1/chapters
Content-Type: application/json

{
  "chapterNumber": 3,
  "title": "第3话：标题",
  "pages": [
    "https://.../page1.jpg",
    "https://.../page2.jpg"
  ]
}
```

#### 更新章节
```
PUT /api/manga/1/chapters/1-3
Content-Type: application/json

{
  "title": "更新后的章节标题",
  "pages": ["https://..."]
}
```

#### 删除章节
```
DELETE /api/manga/1/chapters/1-3
```

### 3. 元数据接口

#### 获取所有标签和分类
```
GET /api/manga/meta
```

响应：
```json
{
  "success": true,
  "data": {
    "tags": ["入门", "进阶", "NLP", "深度学习", ...],
    "categories": ["NLP", "CV", "大模型", "机器学习", ...]
  }
}
```

## 🖥️ 管理界面

访问管理界面：
```
http://localhost:3000/admin
```

功能包括：
- 查看所有漫画列表
- 搜索漫画
- 新建漫画
- 编辑漫画信息
- 删除漫画
- 查看章节列表

## 📝 数据结构示例

```json
{
  "id": "1",
  "title": "大语言模型入门",
  "author": "AI科普团队",
  "description": "从GPT到ChatGPT...",
  "coverImage": "https://...",
  "status": "ongoing",
  "categories": ["大模型", "NLP", "深度学习"],
  "tags": ["大模型", "NLP", "深度学习", "入门", "科普"],
  "updateTime": "2025-12-29",
  "views": 28560,
  "likes": 0,
  "chapters": [
    {
      "id": "1-1",
      "mangaId": "1",
      "chapterNumber": 1,
      "title": "第1话：什么是大语言模型",
      "pages": [
        "https://...page1.jpg",
        "https://...page2.jpg"
      ],
      "updateTime": "2025-12-20"
    }
  ]
}
```

## 🛠️ 工具函数

所有数据操作函数位于 `lib/manga-storage.ts`：

```typescript
// 读取数据
readMangaData(): Manga[]

// 创建漫画
createManga(manga): Manga | null

// 更新漫画
updateManga(id, updates): Manga | null

// 删除漫画
deleteManga(id): boolean

// 添加章节
addChapter(mangaId, chapter): Chapter | null

// 更新章节
updateChapter(mangaId, chapterId, updates): Chapter | null

// 删除章节
deleteChapter(mangaId, chapterId): boolean

// 获取所有标签
getAllTags(): string[]

// 获取所有分类
getAllCategories(): string[]
```

## 💡 使用示例

### 通过 API 创建新漫画

```javascript
const newManga = {
  title: "GAN生成对抗网络",
  author: "AI科普团队",
  description: "探索生成对抗网络的神奇世界",
  coverImage: "https://images.unsplash.com/photo-...",
  status: "ongoing",
  categories: ["深度学习", "计算机视觉"],
  tags": ["GAN", "深度学习", "图像生成", "进阶"]
};

fetch('/api/manga', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newManga)
})
.then(res => res.json())
.then(data => console.log(data));
```

### 直接操作数据文件

```typescript
import { createManga, updateManga } from '@/lib/manga-storage';

// 创建新漫画
const manga = createManga({
  title: "新漫画",
  author: "作者",
  description: "简介",
  coverImage: "https://...",
  status: "ongoing",
  categories: ["NLP"],
  tags: ["入门"],
  updateTime: "2025-12-30",
  views: 0,
  likes: 0,
  chapters: []
});

// 更新漫画
updateManga("1", {
  title: "更新后的标题",
  views: 30000
});
```

## ⚠️ 注意事项

1. **数据备份**：修改数据前建议先备份 `data/manga.json`
2. **ID唯一性**：漫画ID和章节ID必须唯一
3. **图片URL**：建议使用稳定的图床或CDN
4. **章节顺序**：chapterNumber 用于排序，确保正确
5. **标签管理**：建议使用预定义的标签体系

## 🔄 数据迁移

如果从旧的数据结构迁移到新系统：

1. 备份现有数据
2. 使用 `lib/manga-storage.ts` 中的函数操作数据
3. 或直接编辑 `data/manga.json` 文件
4. 重启开发服务器使更改生效

## 📚 相关文件

- `/data/manga.json` - 漫画数据存储文件
- `/lib/manga-storage.ts` - 数据操作工具函数
- `/app/api/manga/route.ts` - 漫画管理 API
- `/app/api/manga/[id]/chapters/route.ts` - 章节管理 API
- `/app/admin/page.tsx` - 管理界面
