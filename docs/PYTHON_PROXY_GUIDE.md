# 🚀 Python 代理服务器 - 完整指南

## 📋 架构说明

```
Node.js 应用 → Python 代理服务器 (3001) → Gemini API
                ↓
            使用 Google Genai SDK
            自动支持系统代理
```

---

## 🎯 优势

| 对比项 | Node.js 直接调用 | Python 代理 |
|--------|----------------|------------|
| **代理支持** | ❌ 需要额外配置 | ✅ 自动支持 |
| **SDK 支持** | ⚠️  需要手动实现 | ✅ 官方 SDK |
| **代码复杂度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **维护成本** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **稳定性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🚀 快速开始

### 步骤 1: 启动 Python 代理服务器

```bash
# 方式 1: 使用启动脚本（推荐）
./start-proxy-server.sh

# 方式 2: 手动启动
python3 gemini_proxy_server.py
```

**预期输出：**
```
============================================================
🚀 Gemini API 代理服务器
============================================================
✅ 服务器地址: http://127.0.0.1:3001
✅ 使用 Python Google SDK
✅ 自动支持系统代理
============================================================

📡 可用端点:
  GET  /health - 健康检查
  POST /api/generate-script - 生成脚本
  POST /api/generate-image - 生成图片
  POST /api/regenerate-image - 重新生成图片

🎯 启动服务器...

 * Running on http://127.0.0.1:3001
```

### 步骤 2: 启动 Node.js 应用

```bash
# 新终端窗口
npm run dev
```

### 步骤 3: 测试连接

```bash
# 测试 Python 服务器健康状态
curl http://127.0.0.1:3001/health
```

**预期响应：**
```json
{
  "status": "ok",
  "client_initialized": true,
  "has_api_key": true
}
```

---

## 📁 文件结构

```
manga-reader/
├── gemini_proxy_server.py          # Python 代理服务器
├── start-proxy-server.sh           # 启动脚本
├── requirements.txt                # Python 依赖
├── lib/services/
│   ├── geminiService.ts           # 原始服务（保留）
│   └── geminiServiceProxy.ts      # 代理客户端（新增）
└── .env.local                      # 环境变量
```

---

## 🔧 配置说明

### Python 依赖 (`requirements.txt`)

```
Flask==3.0.0              # Web 框架
flask-cors==4.0.0         # 跨域支持
python-dotenv==1.0.0     # 环境变量
google-genai==1.0.0      # Google Gemini SDK
Pillow==10.0.0            # 图片处理
```

### 环境变量 (`.env.local`)

```bash
# Gemini API（必需）
GEMINI_API_KEY=your_api_key_here

# 模型配置（可选）
GEMINI_SCRIPT_MODEL=gemini-2.0-flash-exp
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp

# 代理服务器地址（可选）
GEMINI_PROXY_SERVER=http://127.0.0.1:3001

# 速率限制（可选）
GEMINI_RATE_LIMIT_DELAY=2000
```

---

## 📡 API 端点

### 1. 健康检查

```bash
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "client_initialized": true,
  "has_api_key": true
}
```

### 2. 生成脚本

```bash
POST /api/generate-script
Content-Type: application/json

{
  "concept": "RAG",
  "model": "gemini-2.0-flash-exp"
}
```

**响应：**
```json
{
  "success": true,
  "panels": [
    {
      "panelNumber": 1,
      "sceneDescription": "...",
      "dialogue": "..."
    }
  ],
  "totalPanels": 24,
  "rawText": "..."
}
```

### 3. 生成图片

```bash
POST /api/generate-image
Content-Type: application/json

{
  "panel": {
    "panelNumber": 1,
    "sceneDescription": "...",
    "dialogue": "..."
  },
  "style": "peach",
  "model": "gemini-2.0-flash-exp",
  "referenceImageData": "base64..."  // 可选
}
```

**响应：**
```json
{
  "success": true,
  "imageData": "base64_encoded_image_data"
}
```

---

## 🔄 从 Node.js 调用

### 示例代码

```typescript
import { generateComicScript, generatePanelImage } from '@/lib/services/geminiServiceProxy';

// 生成脚本
const panels = await generateComicScript('RAG');

// 生成图片
const imageData = await generatePanelImage(
  panels[0],
  'peach',
  referenceImageData  // 可选
);
```

### 在项目中使用

更新 `app/api/generate-comic/script/route.ts`：

```typescript
import { generateComicScript } from '@/lib/services/geminiServiceProxy';

export async function POST(request: NextRequest) {
  const { concept, style } = await request.json();

  try {
    // 通过 Python 代理生成脚本
    const panels = await generateComicScript(concept);

    return NextResponse.json({
      success: true,
      panels: panels,
      totalPanels: panels.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成脚本失败'
    }, { status: 500 });
  }
}
```

---

## 🐛 故障排查

### 问题 1: Python 服务器启动失败

**错误：**
```
ModuleNotFoundError: No module named 'flask'
```

**解决：**
```bash
# 安装依赖
pip install -r requirements.txt

# 或使用启动脚本
./start-proxy-server.sh
```

---

### 问题 2: 连接被拒绝

**错误：**
```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**解决：**
1. 确保 Python 服务器正在运行
2. 检查端口是否被占用
```bash
# 查看端口占用
lsof -i :3001

# 杀掉占用进程
kill -9 <PID>
```

---

### 问题 3: 代理超时

**错误：**
```
Error: timeout
```

**解决：**
1. 检查系统代理是否运行
2. 测试代理连接：
```bash
curl -x http://127.0.0.1:7890 https://www.google.com
```

---

## 🎯 开发流程

### 完整启动流程

**终端 1: Python 代理服务器**
```bash
./start-proxy-server.sh
```

**终端 2: Node.js 开发服务器**
```bash
npm run dev
```

**终端 3: 日志监控（可选）**
```bash
# 监控 Python 服务器日志
# 或使用 tmux/screen 管理多个窗口
```

---

## 📊 性能优化

### 1. 连接池

Python Flask 默认使用单线程，可以使用 gunicorn：

```bash
pip install gunicorn

gunicorn -w 4 -b 127.0.0.1:3001 gemini_proxy_server:app
```

### 2. 缓存

在 Python 服务器中添加缓存：

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_generate_script(concept):
    # ... 生成逻辑
    pass
```

### 3. 异步处理

使用 Quart 替代 Flask（异步支持）：

```bash
pip install quart
```

---

## 🔐 安全建议

### 1. 限制访问

只允许本地访问（默认配置）：

```python
app.run(host='127.0.0.1', port=3001)
```

### 2. 添加 API 密钥

在 Node.js 和 Python 之间共享密钥：

```python
API_KEY = os.getenv('INTERNAL_API_KEY')

@app.before_request
def check_auth():
    if request.headers.get('X-API-Key') != API_KEY:
        return jsonify({'error': 'Unauthorized'}), 401
```

---

## 📝 日常使用

### 一键启动

创建 `start-all.sh`：

```bash
#!/bin/bash

# 启动 Python 服务器（后台）
./start-proxy-server.sh &
PYTHON_PID=$!

# 等待 Python 服务器启动
sleep 3

# 启动 Node.js 服务器
npm run dev &
NODE_PID=$!

echo "Python PID: $PYTHON_PID"
echo "Node PID: $NODE_PID"

# 清理函数
cleanup() {
    kill $PYTHON_PID $NODE_PID 2>/dev/null
}

trap cleanup EXIT

echo "✅ 所有服务已启动"
echo "按 Ctrl+C 停止所有服务"
```

### 状态检查

```bash
# 检查所有服务
curl http://127.0.0.1:3001/health  # Python
curl http://localhost:3000           # Node.js
```

---

## ✅ 总结

### 优势

1. ✅ **简单可靠** - Python SDK 自动处理代理
2. ✅ **官方支持** - 使用 Google Genai SDK
3. ✅ **易于维护** - 代码清晰，易于调试
4. ✅ **自动代理** - 继承系统代理配置

### 劣势

1. ⚠️ 需要额外运行 Python 服务
2. ⚠️ 增加一层网络调用
3. ⚠️ 部署时需要两个服务

### 适用场景

- ✅ 开发环境
- ✅ 小型项目
- ✅ 需要快速验证功能
- ⚠️ 生产环境建议直接使用 Python 或配置 Node.js 代理

---

## 🎉 下一步

1. **启动服务器**
   ```bash
   ./start-proxy-server.sh
   ```

2. **测试功能**
   - 访问 http://localhost:3000/generate-comic
   - 输入 AI 概念生成漫画

3. **查看日志**
   - Python 服务器输出详细日志
   - Node.js 终端显示请求信息

---

*更新时间：2025-12-31*
*版本：v1.0.0*
