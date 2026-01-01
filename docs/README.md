# 芝士AI吃鱼 - AI知识科普漫画阅读平台

> **版本**: v1.0
> **技术栈**: Next.js 16 + React 19 + TypeScript + TailwindCSS
> **定位**: 通过生动有趣的漫画形式，普及人工智能前沿技术知识

---

## ✨ 主要特性

### 🎨 现代化设计
- **Dify 风格** - 简洁清新的终端绿配色
- **完整设计系统** - 统一的配色、字体、组件规范
- **响应式布局** - 完美适配桌面端和移动端
- **流畅动画** - 优雅的过渡和微交互

### 📖 双模式阅读器
- **翻页模式** - 传统左右翻页，支持键盘快捷键（← →）
- **条漫模式** - 纵向滚动阅读，适合移动端
- **图片保护** - 防止右键保存和拖拽下载

### 🚀 核心功能
- ✅ **用户系统** - 注册、登录、个人中心
- ✅ **评论互动** - 发表评论、点赞评论
- ✅ **收藏功能** - 收藏喜欢的漫画
- ✅ **点赞系统** - 为漫画点赞
- ✅ **浏览统计** - 记录浏览量
- ✅ **本地文件扫描** - 零配置启动

### ⚡ 性能优化
- Next.js 16 App Router（最新特性）
- 图片懒加载
- 浏览器缓存优化
- TypeScript 类型安全

---

## 🛠️ 技术栈

```
前端框架: Next.js 16.1.1 (App Router)
UI 框架: React 19.2.3
开发语言: TypeScript 5
样式方案: TailwindCSS 4
状态管理: React Context + Hooks
数据存储: JSON 文件（本地文件系统）
认证方式: Cookie-based Session
```

---

## 📦 项目结构

```
manga-reader/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── manga/          # 漫画相关 API
│   │   ├── auth/           # 认证 API
│   │   ├── comments/       # 评论 API
│   │   └── images/         # 图片服务 API
│   ├── manga/[id]/         # 漫画详情页
│   ├── read/[id]/          # 阅读器页面
│   ├── user/[id]/          # 用户主页
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
│
├── components/              # React 组件
│   ├── Navbar.tsx          # 导航栏
│   ├── MangaCard.tsx       # 漫画卡片
│   ├── ProtectedImage.tsx  # 受保护图片
│   ├── AuthModal.tsx       # 认证弹窗
│   ├── CommentSidebar.tsx  # 评论侧边栏
│   └── Skeleton.tsx        # 骨架屏
│
├── lib/                    # 工具函数和核心逻辑
│   ├── scanner.ts         # 文件系统扫描
│   ├── storage.ts         # 数据存储管理
│   ├── data.ts            # 示例数据
│   ├── hooks/             # 自定义 Hooks
│   └── contexts/          # React Context
│
├── types/                 # TypeScript 类型定义
│   └── manga.ts
│
├── data/                  # 本地数据存储
│   ├── users.json
│   ├── sessions.json
│   ├── favorites.json
│   └── [漫画系列]/
│
└── docs/                  # 项目文档
    ├── product/          # 产品文档
    ├── development/      # 开发文档
    ├── design/          # 设计文档
    └── deployment/      # 部署文档
```

---

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd manga-reader
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 添加漫画数据

将漫画图片按以下结构放入 `data/` 文件夹：

```
data/
└── 大模型入门/
    ├── 第一话 强化学习求生记/
    │   ├── 封面.png
    │   ├── 1.png
    │   ├── 2.png
    │   └── ...
    └── 第二话 RAG外挂拯救智商记/
        ├── 封面.png
        ├── 1.png
        └── ...
```

启动项目后，系统会自动扫描并加载漫画数据。

---

## 📚 文档导航

### 📖 产品文档
- [产品深度评测](docs/product/PRODUCT_REVIEW.md) - 8维度全面评测
- [优化路线图](docs/product/OPTIMATION_ROADMAP.md) - 6周优化计划
- [双模式阅读指南](docs/product/TWO_MODES_GUIDE.md) - 阅读器使用说明

### 🛠️ 开发文档
- [数据管理指南](docs/development/DATA_MANAGEMENT.md) - 数据结构说明
- [技术解决方案](docs/development/SOLUTION.md) - 架构设计文档
- [API 文档](docs/api/README.md) - API 接口文档

### 🎨 设计文档
- [设计系统](docs/design/Design-System.md) - 配色、字体、组件规范

### 🌐 部署文档
- [部署指南](docs/deployment/README.md) - Vercel/阿里云部署

### 📝 文档中心
- [完整文档索引](docs/README.md) - 所有文档导航

---

## 🎯 功能概览

### 首页 (`/`)
- ✅ Hero 区域介绍
- ✅ 分类筛选（机器学习、深度学习、NLP 等）
- ✅ 标签筛选
- ✅ 漫画网格展示
- ✅ 人气推荐
- ✅ 统计数据展示

### 漫画详情页 (`/manga/[id]`)
- ✅ 封面和信息展示
- ✅ 章节列表
- ✅ 一键开始阅读
- ✅ 收藏功能
- ⏳ 评论系统（待完善）

### 阅读器 (`/read/[id]`)
- ✅ 翻页模式 - 左右翻页，键盘快捷键
- ✅ 条漫模式 - 纵向滚动
- ✅ 页面跳转选择器
- ✅ 进度显示
- ⏳ 预加载优化（待实施）

### 用户中心 (`/user/[id]`)
- ✅ 个人信息展示
- ✅ 收藏列表
- ✅ 阅读历史（待完善）

---

## 🌐 部署

### Vercel 部署（推荐）

1. **推送到 GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **在 Vercel 导入项目**
访问 [vercel.com](https://vercel.com) 并导入仓库

3. **自动部署**
Vercel 会自动检测 Next.js 并部署

### 阿里云 ECS 部署

详细步骤请参考 [部署指南](docs/deployment/README.md)

简要步骤：
```bash
# 1. 安装 Node.js
npm install -g nvm
nvm install 18

# 2. 构建项目
npm run build

# 3. 使用 PM2 启动
npm install -g pm2
pm2 start npm --name "manga-reader" -- start

# 4. 配置 Nginx 反向代理
# (详见部署文档)
```

---

## 🎨 自定义配置

### 修改配色方案

编辑 `app/globals.css` 中的 CSS 变量：

```css
:root {
  --primary: #00D084;        /* 主色调 */
  --text-primary: #09090B;   /* 文字颜色 */
  --bg-primary: #FFFFFF;     /* 背景颜色 */
  /* ... 更多变量 */
}
```

### 修改分类

编辑 `lib/data.ts` 中的 `aiCategories` 数组：

```typescript
export const aiCategories = [
  '机器学习',
  '深度学习',
  'NLP',
  'CV',
  '大模型',
  '强化学习',
];
```

---

## 🔮 后续计划

详见 [优化路线图](docs/product/OPTIMATION_ROADMAP.md)

### 第一阶段（Week 1-2）
- [ ] 搜索功能
- [ ] 骨架屏加载
- [ ] 阅读器预加载
- [ ] 移动端菜单优化
- [ ] 完善详情页

### 第二阶段（Week 3-4）
- [ ] 暗黑模式
- [ ] 双页阅读模式
- [ ] 排序功能
- [ ] 分页加载

### 第三阶段（Week 5-6）
- [ ] 虚拟滚动
- [ ] 图片优化
- [ ] 代码分割
- [ ] CDN 配置

---

## 📊 项目状态

- ✅ **核心功能**: 100% 完成
- ✅ **用户系统**: 100% 完成
- ✅ **阅读器**: 80% 完成（待优化）
- ⏳ **搜索功能**: 0%（计划中）
- ⏳ **性能优化**: 50%（部分完成）

**总体完成度**: 70%

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 组件使用函数式组件
- Hooks 命名以 `use` 开头

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👥 联系方式

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/manga-reader/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/manga-reader/discussions)

---

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 Star ⭐️

---

**Made with ❤️ for AI Education**
**芝士AI吃鱼 Team**
