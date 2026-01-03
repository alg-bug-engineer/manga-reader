# 功能隐藏说明

## 已隐藏的功能

### ❌ 生成漫画功能

**位置**: 导航栏（桌面端和移动端）

**状态**: 已隐藏但保留代码

**隐藏内容**:
1. 导航栏中的"生成漫画"链接
2. `/generate-comic` 路由访问

## 修改的文件

### 1. `/components/layout/Navbar.tsx`

**桌面端菜单** (第35-45行)
```tsx
{/* 生成漫画功能已暂时隐藏
<Link
  href="/generate-comic"
  className="..."
>
  <svg>...</svg>
  <span>生成漫画</span>
</Link>
*/}
```

**移动端菜单** (第125-133行)
```tsx
{/* 生成漫画功能已暂时隐藏
<Link
  href="/generate-comic"
  onClick={() => setMobileMenuOpen(false)}
  className="..."
>
  ⚡ 生成漫画
</Link>
*/}
```

### 2. Python 服务器配置

**`.env.local`**
```bash
ENABLE_IMAGE_GENERATION=false
```

**`gemini_proxy_server.py`**
- 添加了功能开关检查
- 图片生成请求返回 503 错误

## 当前状态

### ✅ 可用功能
- 首页浏览
- 漫画阅读
- 用户认证（登录/注册）
- 个人中心
- 收藏功能
- 评论功能
- 点赞功能
- 搜索功能
- 分类筛选
- 标签筛选

### ❌ 已禁用功能
- 脚本生成：后端可用，前端入口已隐藏
- 图片生成：后端已禁用（`ENABLE_IMAGE_GENERATION=false`）
- 生成漫画页面：导航链接已隐藏

## 如何重新启用

### 方案 1: 只显示导航链接（图片生成仍然禁用）

如果只想恢复导航链接，但图片生成功能仍然禁用：

1. **取消注释 Navbar.tsx 中的代码**：
   - 删除第35行和第125行的注释标记
   - 保留 `{/* 生成漫画功能已暂时隐藏` 和 `*/}` 之间的内容

2. **或者完全删除注释块**

### 方案 2: 完全启用（包括图片生成）

如果以后配置了真实的图片生成服务（如 DALL-E）：

1. **恢复导航链接**（同方案1）

2. **启用图片生成**:
   ```bash
   # .env.local
   ENABLE_IMAGE_GENERATION=true
   ```

3. **配置图片生成服务**
   - OpenAI DALL-E: 需要 `OPENAI_API_KEY`
   - Google Imagen: 需要 GCP 配置

4. **重启 Python 服务器**
   ```bash
   ./start-proxy-server.sh
   ```

## 访问限制

虽然导航链接已隐藏，但以下路由仍然存在（如果知道URL可以直接访问）：

- `/generate-comic` - 生成漫画页面
- `/api/generate-comic/script` - 脚本生成API（可用）
- `/api/generate-comic/image` - 图片生成API（已禁用，返回503）

如果需要完全禁止访问这些路由，需要在路由层面添加权限检查或中间件。

## 技术细节

### 前端隐藏方式
使用 JSX 注释 `{/* ... */}` 包裹组件，这样：
- ✅ 代码保留，方便恢复
- ✅ 不会被打包到生产环境
- ✅ 不影响现有功能

### 后端禁用方式
使用环境变量开关：
```python
ENABLE_IMAGE_GENERATION = os.getenv('ENABLE_IMAGE_GENERATION', 'false').lower() == 'true'

if not ENABLE_IMAGE_GENERATION:
    return jsonify({
        "success": False,
        "error": "图片生成功能当前已禁用...",
        "code": "FEATURE_DISABLED"
    }), 503
```

## 测试

### 验证导航栏
1. 启动开发服务器: `npm run dev`
2. 访问 `http://localhost:3000`
3. 检查导航栏，应该看不到"生成漫画"链接
4. 移动端菜单也应该没有该链接

### 验证API
```bash
# 图片生成应该返回 503
curl -X POST http://127.0.0.1:3001/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"panel": {...}, "style": "peach"}'

# 预期响应：
# {
#   "success": false,
#   "error": "图片生成功能当前已禁用...",
#   "code": "FEATURE_DISABLED"
# }
```

## 相关文档

- `FEATURE_STATUS.md` - 功能状态详细说明
- `IMAGE_GENERATION_SOLUTION.md` - 图片生成解决方案
- `DEBUG_GUIDE.md` - 调试指南

---

**最后更新**: 2025-12-31
**状态**: 生成漫画功能已从前端导航隐藏
