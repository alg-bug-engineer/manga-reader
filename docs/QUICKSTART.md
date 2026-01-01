# 🚀 快速启动指南 - Python 代理服务器

## ✅ 系统架构

```
用户浏览器 → Next.js (3000) → Python 代理 (3001) → Gemini API
                                      ↓
                              Google Genai SDK
                              自动使用系统代理 ✅
```

---

## 📋 启动步骤

### 1️⃣ 首次安装（仅需一次）

```bash
cd manga-reader
./install-proxy.sh
```

这个脚本会：
- 安装 `uv` (Python 包管理器)
- 创建虚拟环境 `.venv`
- 安装所有依赖 (Flask, google-genai, 等)
- 验证安装

### 2️⃣ 启动 Python 代理服务器

```bash
./start-proxy-server.sh
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

### 3️⃣ 验证 Python 服务器

**新终端窗口：**
```bash
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

### 4️⃣ 启动 Node.js 应用

**新终端窗口：**
```bash
cd manga-reader
npm run dev
```

### 5️⃣ 访问应用

```
http://localhost:3000/generate-comic
```

---

## 🎯 完整工作流程

### 终端 1: Python 代理服务器
```bash
./start-proxy-server.sh
```

### 终端 2: Node.js 开发服务器
```bash
npm run dev
```

### 浏览器: 访问生成器
```
http://localhost:3000/generate-comic
```

---

## 📊 请求流程

### 1. 用户输入概念 "RAG"

### 2. Node.js 前端 → Python 代理
```typescript
// /app/api/generate-comic/script/route.ts
fetch('/api/generate-comic/script', {
  method: 'POST',
  body: JSON.stringify({ concept: 'RAG', style: 'peach' })
})
```

### 3. Python 代理调用 Gemini API
```python
# /gemini_proxy_server.py
response = client.models.generate_content(
    model='gemini-2.0-flash-exp',
    contents=prompt
)
```

### 4. 返回生成的脚本/图片

### 5. Next.js 前端展示结果

---

## 🔧 故障排查

### ❌ 问题 1: 端口 3001 被占用

**错误：**
```
Address already in use
```

**解决：**
```bash
# 查看占用进程
lsof -i :3001

# 杀掉进程
kill -9 <PID>
```

---

### ❌ 问题 2: ModuleNotFoundError

**错误：**
```
ModuleNotFoundError: No module named 'flask'
```

**解决：**
```bash
# 重新运行安装脚本
./install-proxy.sh

# 或手动安装
source .venv/bin/activate
uv pip install -r requirements.txt
```

---

### ❌ 问题 3: 连接被拒绝

**错误：**
```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**解决：**
1. 确保 Python 服务器正在运行
2. 检查 `http://127.0.0.1:3001/health`
3. 查看终端输出

---

### ❌ 问题 4: API Key 未设置

**错误：**
```
"has_api_key": false
```

**解决：**
```bash
# 检查 .env.local 文件
cat .env.local | grep GEMINI_API_KEY

# 如果没有，运行设置脚本
./setup-gemini.sh
```

---

## 📝 日常使用

### 一键启动（推荐）

创建 `start-all.sh`：
```bash
#!/bin/bash

# 启动 Python 服务器（后台）
./start-proxy-server.sh &
PYTHON_PID=$!

# 等待启动
sleep 3

# 启动 Node.js 服务器
npm run dev &
NODE_PID=$!

echo "✅ Python PID: $PYTHON_PID"
echo "✅ Node PID: $NODE_PID"

# 清理函数
cleanup() {
    echo "停止所有服务..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null
}

trap cleanup EXIT

echo "🎉 所有服务已启动"
echo "按 Ctrl+C 停止所有服务"

wait
```

使用：
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## ✅ 验证清单

在开始使用前，请确认：

- [ ] Python 服务器启动成功 (`./start-proxy-server.sh`)
- [ ] 健康检查通过 (`curl http://127.0.0.1:3001/health`)
- [ ] Node.js 应用启动成功 (`npm run dev`)
- [ ] 能访问 `http://localhost:3000/generate-comic`
- [ ] 环境变量已配置 (`GEMINI_API_KEY`)
- [ ] 系统代理正在运行 (Clash/V2Ray)

---

## 🎉 下一步

1. **访问生成器**
   ```
   http://localhost:3000/generate-comic
   ```

2. **输入 AI 概念**
   - 例如：RAG、LLM、Transformer、Embedding

3. **选择风格**
   - 蜜桃灰灰
   - 暴躁猫
   - 哆啦A梦

4. **生成漫画**
   - 自动生成脚本
   - 逐格生成图片
   - 支持重新生成
   - 发布到平台

---

## 📚 相关文档

- **[PYTHON_PROXY_GUIDE.md](./PYTHON_PROXY_GUIDE.md)** - 完整技术指南
- **[PYTHON_PROXY_SUMMARY.md](./PYTHON_PROXY_SUMMARY.md)** - 架构总结
- **[gemini_proxy_server.py](./gemini_proxy_server.py)** - 服务器源码
- **[requirements.txt](./requirements.txt)** - Python 依赖

---

*更新时间：2025-12-31*
*版本：v1.0.0*
*状态：✅ 生产就绪*
