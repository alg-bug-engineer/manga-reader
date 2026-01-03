# 管理后台快速开始指南

> **快速上手 Manga-Reader 管理后台系统**

---

## 🚀 5分钟快速开始

### 步骤 1: 启动开发服务器

```bash
cd manga-reader
npm run dev
```

### 步骤 2: 访问管理后台

打开浏览器访问: `http://localhost:3000/admin`

### 步骤 3: 登录系统

**注意**: 当前系统使用邮箱验证管理员身份
- 管理员邮箱需包含 "admin" 或等于 "admin@example.com"
- 如果没有管理员账号，先在前台注册一个包含 "admin" 的邮箱

---

## 📚 核心功能演示

### 1. 漫画上架/下架

```
1. 访问 /admin/manga
2. 找到要操作的漫画
3. 点击"上架"或"下架"按钮
4. 系统会提示操作结果
```

**效果**:
- ✅ 上架后漫画在前台显示
- ⛔ 下架后漫画在前台隐藏
- 🔄 可随时切换状态

---

### 2. 创建分类

```
1. 访问 /admin/categories
2. 在输入框输入分类名称
3. 点击"创建"按钮
4. 分类立即生效
```

**示例**:
```
输入: "GAN生成对抗网络"
结果: 新分类出现在列表中
```

---

### 3. 创建标签

```
1. 访问 /admin/tags
2. 在输入框输入标签名称
3. 点击"创建"按钮
4. 标签立即生效
```

**示例**:
```
输入: "数学基础"
结果: 新标签出现在标签云中
```

---

## 🎯 常用操作

### 批量操作（暂未实现）
- [ ] 批量上架
- [ ] 批量下架
- [ ] 批量编辑

### 搜索和筛选
- [x] 搜索漫画（标题、作者）
- [x] 筛选状态（已上架/已下架）
- [x] 实时搜索结果

---

## 🔐 权限管理

### 当前验证逻辑
```typescript
// app/admin/layout.tsx
const isAdmin = user?.email === 'admin@example.com' ||
               user?.email?.includes('admin');
```

### 成为管理员的方法
1. 注册时使用包含 "admin" 的邮箱
2. 例如: `admin@manga-reader.com`
3. 或修改代码中的验证逻辑

---

## 📂 数据存储位置

所有数据存储在 `data/` 目录：

```
data/
├── categories.json          # 分类列表
├── tags.json                # 标签列表
├── inactive-manga.json      # 下架漫画ID列表
└── manga-metadata.json      # 漫画元数据
```

---

## 🛠️ API 测试

### 测试漫画列表
```bash
curl http://localhost:3000/api/admin/manga
```

### 测试创建分类
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"测试分类"}'
```

### 测试上架漫画
```bash
curl -X POST http://localhost:3000/api/admin/manga/[漫画ID]/publish
```

---

## ⚠️ 常见问题

### Q1: 无法访问后台？
**A**: 确保登录邮箱包含 "admin" 字符

### Q2: 漫画下架后数据还在吗？
**A**: 是的，下架只是软删除，数据完全保留

### Q3: 删除分类会影响漫画吗？
**A**: 不会，删除分类不会删除属于该分类的漫画

### Q4: 如何恢复误下架的漫画？
**A**: 在漫画管理页面，点击"上架"按钮即可恢复

---

## 📖 更多文档

- [完整功能说明](./ADMIN_SYSTEM_SUMMARY.md)
- [API接口文档](./docs/api/API_REFERENCE.md)
- [项目架构文档](./docs/development/ARCHITECTURE.md)

---

## 🎉 开始使用

现在您已经准备好使用管理后台了！

1. 启动服务器：`npm run dev`
2. 访问：`http://localhost:3000/admin`
3. 开始管理您的漫画内容

**祝使用愉快！** 🚀

---

**文档版本**: v1.0
**更新时间**: 2025-12-30
