# Design System - 芝士AI吃鱼

## 1. 品牌定位
**芝士AI吃鱼** 是一个AI知识科普漫画平台，通过生动有趣的漫画形式，让复杂的AI概念变得简单易懂。

## 2. 视觉语言

### 2.1 设计风格
- **风格定位**: 友好、现代、科技感 + 温暖的教育氛围
- **核心理念**: 简约而不简单，清晰而有趣
- **设计参考**: 结构线风格（Structural Grid）+ 微渐变 + 卡通友好

### 2.2 配色系统 (Color Palette)

遵循 **60-30-10** 配色原则：

#### 主色调 (60% - 背景色)
```css
--bg-primary: #FAFAF9;      /* Stone-50 - 主背景 */
--bg-secondary: #FFFFFF;     /* Pure White - 卡片背景 */
--bg-tertiary: #F5F5F4;     /* Stone-100 - 次级背景 */
```

#### 辅助色 (30% - 次要元素)
```css
--text-primary: #1C1917;    /* Stone-900 - 主要文字 */
--text-secondary: #57534E;  /* Stone-600 - 次要文字 */
--text-muted: #A8A29E;      /* Stone-400 - 辅助文字 */
--border-color: #E7E5E4;    /* Stone-200 - 边框 */
```

#### 强调色 (10% - 核心互动元素)
```css
--primary: #8B5CF6;         /* Violet-500 - 品牌主色 */
--primary-hover: #7C3AED;   /* Violet-600 - 悬停态 */
--primary-light: #DDD6FE;   /* Violet-200 - 浅色强调 */
```

#### 语义化颜色
```css
--success: #10B981;         /* Emerald-500 - 成功/连载中 */
--warning: #F59E0B;         /* Amber-500 - 警告/暂停 */
--neutral: #78716C;         /* Stone-500 - 中性/已完结 */
```

### 2.3 字体系统 (Typography)

#### 字体族
```css
font-family: {
  sans: [
    "Manrope",              /* 英文主字体 - 现代友好 */
    "Noto Sans SC",         /* 中文主字体 */
    "system-ui",
    "sans-serif"
  ],
  display: [
    "Outfit",               /* 标题字体 - 几何现代感 */
    "Noto Sans SC",
    "sans-serif"
  ],
  mono: [
    "JetBrains Mono",       /* 代码/标签字体 */
    "monospace"
  ]
}
```

#### 字号阶梯 (Major Third - 1.25)
| 用途 | 字号 | Tailwind Class | 字重 |
|------|------|----------------|------|
| H1 - 主标题 | 39px | text-4xl | font-bold (700) |
| H2 - 大标题 | 31px | text-3xl | font-bold (700) |
| H3 - 中标题 | 25px | text-2xl | font-semibold (600) |
| H4 - 小标题 | 20px | text-xl | font-semibold (600) |
| Body - 正文 | 16px | text-base | font-normal (400) |
| Small - 小字 | 14px | text-sm | font-normal (400) |
| XSmall - 辅助 | 12px | text-xs | font-medium (500) |

#### 行高系统
- 标题: 1.2 (leading-tight)
- 正文: 1.6 (leading-relaxed)
- 说明文字: 1.5 (leading-normal)

### 2.4 间距系统 (Spacing)

基于 **8px** 网格系统：
```css
/* 组件内部 */
--spacing-xs: 4px;    /* gap-1 */
--spacing-sm: 8px;    /* gap-2 */
--spacing-md: 12px;   /* gap-3 */
--spacing-lg: 16px;   /* gap-4 / p-4 */

/* 卡片间距 */
--spacing-xl: 24px;   /* gap-6 / mb-6 */
--spacing-2xl: 32px;  /* gap-8 / mb-8 */

/* 区块间距 */
--spacing-3xl: 64px;  /* py-16 */
--spacing-4xl: 96px;  /* py-24 */
--spacing-5xl: 128px; /* py-32 */
```

### 2.5 组件质感 (Component Characteristics)

#### 圆角 (Border Radius)
```css
--radius-sm: 8px;     /* rounded-lg - 小卡片、标签 */
--radius-md: 12px;    /* rounded-xl - 按钮、输入框 */
--radius-lg: 16px;    /* rounded-2xl - 卡片 */
--radius-full: 9999px; /* rounded-full - 徽章 */
```

#### 阴影 (Shadows)
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

#### 边框 (Borders)
```css
--border-thin: 1px solid var(--border-color);
--border-medium: 1.5px solid var(--border-color);
```

### 2.6 布局系统 (Layout)

#### 容器宽度
```css
--container-sm: 640px;   /* max-w-sm */
--container-md: 768px;   /* max-w-md */
--container-lg: 1024px;  /* max-w-lg */
--container-xl: 1280px;  /* max-w-xl */
--container-2xl: 1440px; /* max-w-2xl */
```

#### 栅格列数
- 移动端: 2列
- 平板: 3列
- 桌面: 4列
- 大屏: 5列

## 3. 组件规范

### 3.1 按钮 (Buttons)

#### 主要按钮 (Primary)
```css
/* 样式 */
bg-gradient-to-r from-violet-500 to-purple-500
text-white font-semibold px-6 py-3 rounded-xl
hover:shadow-lg hover:scale-105 transition-all

/* 使用场景: CTA、提交、开始阅读 */
```

#### 次要按钮 (Secondary)
```css
/* 样式 */
border-2 border-violet-300 text-violet-600
font-semibold px-6 py-3 rounded-xl
hover:bg-violet-50 transition

/* 使用场景: 取消、返回、收藏 */
```

#### 文字按钮 (Ghost)
```css
/* 样式 */
text-violet-600 font-medium px-4 py-2
hover:text-violet-700 hover:bg-violet-50 rounded-lg transition

/* 使用场景: 辅助操作 */
```

### 3.2 卡片 (Cards)

#### 漫画卡片 (Manga Card)
```css
/* 基础样式 */
bg-white rounded-2xl shadow-sm border border-stone-200
overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300

/* 内容区域 */
- 封面: aspect-[3/4], 圆角 16px
- 标题: font-semibold text-stone-900 text-base
- 标签: bg-violet-50 text-violet-700 px-2.5 py-1 rounded-md
- 元信息: text-stone-400 text-xs pt-2 border-t border-stone-50
```

#### 知识点卡片 (Chapter Card)
```css
/* 基础样式 */
bg-white rounded-xl border border-stone-200
hover:border-violet-400 hover:shadow-md transition-all
bg-gradient-to-r from-violet-50/50 to-purple-50/50

/* 内边距: p-4 (16px) */
/* 卡片间距: gap-3 (12px) */
```

### 3.3 导航栏 (Navigation)
```css
/* 样式 */
sticky top-0 z-50
bg-white/80 backdrop-blur-md
border-b border-stone-200 shadow-sm
px-4 py-4

/* Logo */
bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent
font-bold text-xl

/* 链接 */
text-stone-600 hover:text-violet-600 font-medium transition
```

### 3.4 标签 (Tags)
```css
/* 分类标签 */
bg-gradient-to-r from-violet-50 to-indigo-50
text-violet-700 px-3 py-1.5 rounded-full text-sm font-medium
border border-violet-100

/* 状态标签 */
- 连载中: bg-emerald-50 text-emerald-700 border border-emerald-200
- 已完结: bg-stone-50 text-stone-700 border border-stone-200
- 暂停: bg-amber-50 text-amber-700 border border-amber-200
```

### 3.5 输入框 (Input)
```css
/* 样式 */
w-full px-4 py-3
bg-stone-50 border border-stone-200
rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500
focus:border-transparent transition

/* 占位符: text-stone-400 */
```

## 4. 动效规范 (Animation)

### 4.1 过渡时长
```css
--duration-fast: 150ms;    /* 快速反馈 */
--duration-base: 300ms;    /* 标准过渡 */
--duration-slow: 500ms;    /* 复杂动画 */
```

### 4.2 缓动函数
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* 标准缓动 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 弹跳效果 */
```

### 4.3 常用动效
```css
/* 悬停放大 */
hover:scale-105 transition-transform duration-300

/* 渐入动画 */
animate-fade-in: opacity 0 → 1, duration-500ms

/* 滑动 */
animate-slide-up: translateY(20px) → 0, duration-300ms
```

## 5. 响应式断点

```css
--breakpoint-sm: 640px;   /* sm */
--breakpoint-md: 768px;   /* md */
--breakpoint-lg: 1024px;  /* lg */
--breakpoint-xl: 1280px;  /* xl */
--breakpoint-2xl: 1536px; /* 2xl */
```

## 6. 图片规范

### 6.1 漫画封面
- **尺寸比例**: 3:4 (纵向)
- **最小宽度**: 300px
- **文件格式**: PNG (支持透明度)
- **优化**: WebP 格式 + 懒加载

### 6.2 漫画内容页
- **尺寸比例**: 自适应，保持原始比例
- **最大宽度**: 800px (阅读器)
- **格式**: PNG
- **加载**: 懒加载 + 预加载下一页

### 6.3 头像/Logo
- **形状**: 圆形或圆角正方形
- **尺寸**: 40px - 80px

## 7. 可访问性 (Accessibility)

### 7.1 对比度要求
- 正文文字 (16px): ≥ 4.5:1
- 大标题 (24px+): ≥ 3:1
- UI组件图标: ≥ 3:1

### 7.2 交互反馈
- 所有可点击元素: hover 态 + focus 态
- 禁用状态: opacity-50 + cursor-not-allowed
- 加载状态: Loading 指示器

## 8. 使用指南

### 8.1 在 Tailwind 配置中使用
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        // ... 其他颜色
      },
      fontFamily: {
        sans: ['Manrope', 'Noto Sans SC', 'sans-serif'],
        display: ['Outfit', 'Noto Sans SC', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',  /* 72px */
        '22': '5.5rem',  /* 88px */
      }
    }
  }
}
```

### 8.2 在新页面中应用
1. 引入设计系统变量
2. 遵循组件规范
3. 使用统一的间距和圆角
4. 保持一致的配色和字体

---

**版本**: v1.0
**更新日期**: 2025-12-29
**维护者**: 芝士AI吃鱼团队
