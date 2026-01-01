# AI漫画生成器 - 使用指南

这是一个基于 Next.js 和 Gemini API 构建的 AI 漫画生成功能模块，可以将 AI 概念转换为生动有趣的科普漫画。

## 功能特点

✨ **智能脚本生成**：基于用户输入的 AI 概念，自动生成多格漫画脚本
🎨 **多种风格选择**：支持蜜桃灰灰、暴躁猫、哆啦A梦三种风格
🖼️ **AI图片生成**：使用 Gemini API 生成高质量的漫画图片
🔄 **单张重新生成**：支持对不满意的单张图片进行重新生成
📚 **一键发布**：生成完成后可直接发布到平台
🌓 **暗色模式**：完整的暗色模式支持
📱 **响应式设计**：完美支持桌面端和移动端

## 安装和配置

### 1. 环境变量配置

复制 `.env.example` 文件并重命名为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的 Gemini API Key：

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_SCRIPT_MODEL=gemini-2.0-flash-exp
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp
GEMINI_RATE_LIMIT_DELAY=2000
```

### 2. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的 Google 账号
3. 创建新的 API Key
4. 将 API Key 复制到 `.env.local` 文件中

### 3. 添加风格参考图片

在 `public/styles/` 目录下添加三种风格的参考图片：

- `peach-preview.png` - 蜜桃灰灰风格预览图
- `peach-reference.png` - 蜜桃灰灰风格角色参考图
- `cat-preview.png` - 暴躁猫风格预览图
- `cat-reference.png` - 暴躁猫风格角色参考图
- `doraemon-preview.png` - 哆啦A梦风格预览图
- `doraemon-reference.png` - 哆啦A梦风格角色参考图

详细说明请参考 `public/styles/README.md`

## 使用流程

### 1. 访问生成器

在导航栏点击 **"生成漫画"** 或直接访问 `/generate-comic` 路径

### 2. 输入AI概念

在输入框中输入你想要解释的 AI 概念，例如：
- RAG
- LLM
- Transformer
- Embedding
- Token
- Fine-tuning

也可以点击热门概念快速填入

### 3. 选择漫画风格

选择三种风格之一：
- **蜜桃灰灰**：可爱粉嫩，温馨治愈
- **暴躁猫**：夸张搞笑，动感十足
- **哆啦A梦**：简约友好，经典怀旧

### 4. 生成脚本

点击"开始生成漫画"按钮，系统会：
1. 调用 Gemini API 生成漫画脚本
2. 显示生成的脚本预览
3. 自动开始生成图片

### 5. 审核和编辑

图片生成完成后：
- 查看所有生成的漫画格
- 悬停在图片上可以点击"重新生成"
- 修改不满意的图片

### 6. 发布漫画

确认无误后：
1. 填写漫画标题、作者、描述
2. 选择分类和标签
3. 点击"发布漫画"
4. 系统自动保存到 data 目录

## 技术架构

### 前端组件

```
app/generate-comic/page.tsx          # 主页面
components/manga-generation/
├── StyleSelector.tsx                # 风格选择器
├── ScriptViewer.tsx                 # 脚本查看器
├── ComicGrid.tsx                    # 漫画网格展示
└── PublishForm.tsx                  # 发布表单
```

### API 路由

```
app/api/generate-comic/
├── script/route.ts                  # 脚本生成 API
├── regenerate/route.ts              # 图片重新生成 API
├── save-image/route.ts              # 图片保存 API
└── publish/route.ts                 # 漫画发布 API
```

### 核心服务

```
lib/services/geminiService.ts        # Gemini API 调用服务
```

### 类型定义

```
types/manga-generation.ts            # 漫画生成相关类型定义
```

## 系统提示词

系统使用了一个精心设计的提示词模板，确保生成的漫画：

1. **强制比喻**：将抽象概念转化为生活化比喻
2. **固定人设**：呆萌机器人 + 暴躁猫的组合
3. **口语化风格**：接地气、易理解、带幽默感
4. **完整结构**：起因 → 解释 → 冲突 → 总结

## 生成流程

```
用户输入概念
    ↓
选择风格
    ↓
调用 Gemini API 生成脚本
    ↓
解析脚本数据
    ↓
顺序生成图片（带速率限制）
    ↓
展示给用户审核
    ↓
重新生成（可选）
    ↓
发布到平台
```

## 自定义和扩展

### 修改系统提示词

编辑 `lib/services/geminiService.ts` 文件中的 `SCRIPT_SYSTEM_PROMPT` 常量

### 添加新风格

1. 在 `types/manga-generation.ts` 中添加新的风格类型
2. 在 `components/manga-generation/StyleSelector.tsx` 中添加风格选项
3. 在 `public/styles/` 添加对应的参考图片

### 调整速率限制

修改 `.env.local` 文件中的 `GEMINI_RATE_LIMIT_DELAY` 值（单位：毫秒）

## API 费用说明

Gemini API 按使用量收费：

- **脚本生成**：每次请求约消耗 1000-5000 tokens
- **图片生成**：每张图片消耗一定额度
- **建议**：设置每日使用限制以控制成本

## 注意事项

1. **API Key 安全**：不要将 `.env.local` 文件提交到 Git
2. **速率限制**：生成大量图片时注意 API 速率限制
3. **图片质量**：生成质量取决于 Gemini API 的当前能力
4. **错误处理**：网络问题或 API 限制可能导致生成失败
5. **存储空间**：生成的图片会保存在服务器，注意磁盘空间

## 常见问题

### Q: 生成失败怎么办？
A: 检查 API Key 是否正确，网络是否正常，Gemini API 是否可用

### Q: 图片生成太慢？
A: 这是正常现象，AI 生成图片需要时间，可以调整速率限制参数

### Q: 如何提高生成质量？
A: 提供更详细的角色参考图，优化系统提示词

### Q: 可以批量生成吗？
A: 目前系统设计为顺序生成，以避免超过 API 速率限制

## 开发计划

- [ ] 支持上传自定义参考图片
- [ ] 添加批量导出功能
- [ ] 支持视频生成
- [ ] 添加生成历史记录
- [ ] 支持多人协作编辑
- [ ] 添加评论和反馈系统

## 技术支持

如有问题或建议，请：
1. 查看项目文档
2. 提交 Issue
3. 联系开发团队

---

**享受创作的乐趣！** 🎨✨
