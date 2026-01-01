# 芝士AI吃鱼 (Manga-Reader)

> 🧀 通过生动有趣的漫画形式，轻松掌握人工智能前沿技术

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 项目简介

**芝士AI吃鱼** 是一个专注于 AI 知识科普的漫画阅读平台，致力于用生动有趣的漫画形式，普及人工智能前沿技术知识，让学习 AI 变得简单有趣。

### ✨ 核心特性

- 🎨 **现代设计系统**: Dify 风格 + 终端绿主题，视觉清爽
- 📱 **完美响应式**: 移动端优先设计，完美适配各种设备
- 🌓 **双主题支持**: 亮色/暗色模式无缝切换
- ⚡ **性能优化**: 智能预加载、懒加载、骨架屏
- 🔐 **用户系统**: Cookie-based Session 认证
- 💬 **互动功能**: 收藏、点赞、评论
- 📖 **三种阅读模式**: 条漫、单页、双页随心切换

### 🎯 产品定位

**目标用户**:
- AI 技术初学者
- 希望快速了解 AI 概念的人群
- 喜欢视觉化学习的用户
- 移动端碎片化学习用户

**核心价值**:
- 🎨 视觉化学习：漫画形式降低学习门槛
- 🤖 AI 科普：聚焦 AI 前沿技术知识
- 📱 多端适配：完美支持桌面端和移动端
- 🌓 舒适阅读：支持明暗双主题

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.17.0
- npm >= 9.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/manga-reader.git
cd manga-reader
```

2. **安装依赖**
```bash
npm install
```

3. **准备数据**
```bash
# 在 data/ 目录下放置漫画文件
# 支持两种目录结构：
#
# 方式1: 多章节模式
# data/
# └── 漫画系列/
#     ├── 封面.png
#     └── 第1话/
#         ├── 1.png
#         └── 2.png
#
# 方式2: 单章节模式
# data/
# └── 漫画系列/
#     ├── 封面.png
#     ├── 1.png
#     └── 2.png
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
```
打开浏览器访问: http://localhost:3000
```

### 其他命令

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

---

## 📁 项目结构

```
manga-reader/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由 (20个端点)
│   ├── manga/[id]/        # 漫画详情页
│   ├── read/[id]/         # 阅读器页面
│   ├── user/[id]/         # 用户中心
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
│
├── components/            # React 组件 (按功能分类)
│   ├── layout/           # 布局组件 (1个)
│   ├── manga/            # 漫画组件 (3个)
│   ├── ui/               # UI 组件 (4个)
│   └── feedback/         # 反馈组件 (2个)
│
├── lib/                  # 核心逻辑库
│   ├── contexts/        # React Context (3个)
│   ├── hooks/           # 自定义 Hooks (3个)
│   ├── scanner.ts       # 文件系统扫描器
│   ├── storage.ts       # 数据存储管理
│   └── data.ts          # 示例数据
│
├── types/               # TypeScript 类型定义
│   └── manga.ts
│
├── data/                # 本地数据存储
│   ├── users.json
│   ├── sessions.json
│   ├── favorites.json
│   ├── likes.json
│   ├── views.json
│   ├── comments.json
│   └── [漫画系列]/       # 漫画图片文件夹
│
├── docs/                # 项目文档
│   ├── product/        # 产品文档
│   ├── development/    # 开发文档
│   ├── design/         # 设计文档
│   ├── deployment/     # 部署文档
│   └── api/            # API 文档
│
└── public/             # 静态资源
```

详细的架构说明请查看：[开发文档](./docs/development/ARCHITECTURE.md)

---

## 🛠️ 技术栈

### 核心框架

- **Next.js 16.1.1**: React 全栈框架，使用 App Router
- **React 19.2.3**: UI 库，支持 Server Components
- **TypeScript 5**: 类型安全的 JavaScript 超集

### 样式方案

- **TailwindCSS 4**: 实用工具优先的 CSS 框架
- **CSS Variables**: 设计系统变量管理
- **Google Fonts**: Manrope、Outfit、Noto Sans SC、JetBrains Mono

### 状态管理

- **React Context API**: 全局状态管理（认证、主题、Toast）
- **Custom Hooks**: 业务逻辑封装

### 数据存储

- **JSON 文件系统**: 本地文件存储
- **文件系统扫描**: 自动加载漫画数据

---

## 📚 核心功能

### 1. 漫画浏览

- ✅ 多维度筛选（分类、标签、搜索）
- ✅ 多种排序方式（最新、人气、浏览、点赞）
- ✅ 响应式网格布局（2-5列自适应）
- ✅ 骨架屏加载动画
- ✅ 分页加载更多

### 2. 阅读器

- ✅ **三种阅读模式**:
  - 条漫模式（纵向滚动）
  - 单页模式（翻页）
  - 双页模式（并排显示）
- ✅ 智能图片预加载（前后 2-4 页）
- ✅ 键盘快捷键（← → 翻页）
- ✅ 触摸手势支持（滑动翻页）
- ✅ 页面跳转选择器
- ✅ 图片保护（禁用右键和拖拽）

### 3. 用户系统

- ✅ 用户注册/登录
- ✅ Cookie-based Session 认证
- ✅ 个人中心
- ✅ 收藏管理
- ✅ 阅读历史（待完善）

### 4. 互动功能

- ✅ 收藏漫画
- ✅ 点赞漫画和评论
- ✅ 发表评论
- ✅ 浏览量统计

### 5. 主题系统

- ✅ 亮色主题（清新自然）
- ✅ 暗色主题（深邃舒适）
- ✅ 一键切换
- ✅ 系统偏好跟随

---

## 🎨 设计系统

### 配色方案

```css
/* 亮色主题 */
--bg-primary: #FFFFFF;
--text-primary: #09090B;
--primary: #00D084;  /* 终端绿 */

/* 暗色主题 */
--bg-primary: #09090B;
--text-primary: #FAFAF9;
--primary: #10B981;  /* 更亮的绿色 */
```

### 设计原则

- **极简主义**: 去除多余装饰，突出内容本身
- **结构线设计**: 使用细边框定义区域和层级
- **终端绿主题**: 符合 AI 科普产品定位
- **一致性**: 统一的圆角、间距、阴影系统

详细的设计文档请查看：[设计规范](./docs/design/DESIGN_SYSTEM.md)

---

## 📡 API 文档

### API 端点

#### 认证 API
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

#### 漫画 API
```
GET    /api/manga/local
GET    /api/manga/[id]
POST   /api/manga/[id]/view
POST   /api/manga/[id]/like
```

#### 其他 API
```
GET    /api/chapter/[id]
GET    /api/comments
POST   /api/comments
GET    /api/favorites
POST   /api/favorites/toggle
GET    /api/stats
```

完整的 API 文档请查看：[API 参考](./docs/api/API_REFERENCE.md)

---

## 📖 文档

### 产品文档
- [产品评测报告](./docs/product/PRODUCT_REVIEW_DETAILED.md) - 深度产品评测（评分 4.26/5.0）
- [优化路线图](./docs/product/OPTIMIZATION_ROADMAP_2025.md) - 2025年产品优化规划

### 开发文档
- [项目架构文档](./docs/development/ARCHITECTURE.md) - 技术架构和代码组织
- [开发指南](./docs/development/README.md) - 开发环境配置和最佳实践

### 设计文档
- [设计系统](./docs/design/DESIGN_SYSTEM.md) - UI/UX 设计规范
- [组件库](./docs/design/COMPONENT_LIBRARY.md) - 可复用组件说明

### 部署文档
- [部署指南](./docs/deployment/README.md) - Vercel、Docker 等部署方案

### API 文档
- [API 参考](./docs/api/API_REFERENCE.md) - 完整的 API 接口文档

---

## 🚢 部署

### Vercel 部署（推荐）

1. **连接 GitHub 仓库**
   - 访问 [Vercel](https://vercel.com)
   - 导入项目仓库

2. **配置项目**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### Docker 部署

```bash
# 构建镜像
docker build -t manga-reader .

# 运行容器
docker run -p 3000:3000 manga-reader
```

详细的部署指南请查看：[部署文档](./docs/deployment/README.md)

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 贡献方式

1. **报告 Bug**: 在 Issues 中提交问题
2. **提出建议**: 在 Discussions 中讨论新功能
3. **提交代码**: 提交 Pull Request
4. **完善文档**: 改进文档质量

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📊 项目状态

### 当前版本

**版本号**: v1.0.0
**发布日期**: 2025-01-01
**产品评分**: 4.26/5.0 (优秀 A-)

### 开发进度

- ✅ 基础框架搭建
- ✅ 用户认证系统
- ✅ 漫画阅读器
- ✅ 互动功能（收藏、点赞、评论）
- ✅ 响应式设计
- ✅ 主题系统
- ⏳ 阅读历史（进行中）
- ⏳ 推荐系统（规划中）
- ⏳ 搜索优化（规划中）

详细的优化计划请查看：[优化路线图](./docs/product/OPTIMIZATION_ROADMAP_2025.md)

---

## 🙏 致谢

### 开源项目

本项目深受以下开源项目启发：
- [Next.js](https://github.com/vercel/next.js)
- [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)
- [Dify](https://github.com/langgenius/dify) - 设计系统参考
- [MangaDex](https://mangadex.org/) - 功能参考

### 技术支持

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

```
MIT License

Copyright (c) 2025 芝士AI吃鱼

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 联系方式

- **项目主页**: [https://github.com/your-username/manga-reader](https://github.com/your-username/manga-reader)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/manga-reader/issues)
- **邮箱**: your-email@example.com

---

<div align="center">

**🧀 芝士AI吃鱼 - 让 AI 学习变得简单有趣**

Made with ❤️ for AI Education

</div>
