# 🎉 测试工具创建完成报告

## ✅ 已完成的工作

### 创建的测试工具

#### 1. **Bash 测试脚本** (`test-gemini-api.sh`)
- ✅ 自动加载环境变量
- ✅ 网络连接测试
- ✅ 基本 API 请求测试
- ✅ 脚本生成功能测试
- ✅ 彩色输出和错误提示

**使用方法：**
```bash
./test-gemini-api.sh
```

#### 2. **Node.js 测试脚本** (`test-gemini-api.js`)
- ✅ 最详细的测试覆盖
- ✅ 彩色输出（成功/失败/警告）
- ✅ 完整的请求/响应日志
- ✅ 性能计时
- ✅ 自动错误分析
- ✅ 脚本格式验证
- ✅ JSON 格式化输出

**使用方法：**
```bash
node test-gemini-api.js
```

#### 3. **测试指南** (`TESTING_GUIDE.md`)
- ✅ 三种测试方式说明
- ✅ curl 命令示例
- ✅ 问题排查指南
- ✅ 错误解决方案
- ✅ 测试检查清单

---

## 🚀 快速开始

### 方式 1: Node.js 脚本（推荐）

```bash
# 1. 确保 .env.local 已配置
cat .env.local | grep GEMINI_API_KEY

# 2. 运行测试
node test-gemini-api.js

# 3. 查看结果
# ✅ 所有测试通过 - 可以开始使用
# ❌ 测试失败 - 查看错误信息
```

### 方式 2: Bash 脚本

```bash
# 运行测试
./test-gemini-api.sh

# 自动执行 3 个测试
# - 网络连接
# - API 请求
# - 脚本生成
```

### 方式 3: curl 命令

```bash
# 快速测试网络
curl -I "https://generativelanguage.googleapis.com"

# 测试 API（需要先设置 API Key）
export GEMINI_API_KEY="your_key"

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -X POST \
  -d '{"contents": [{"parts": [{"text": "Hello!"}]}]}'
```

---

## 📊 测试输出示例

### 成功的情况

```
╔════════════════════════════════════╗
║   🧪 Gemini API 功能测试工具      ║
╚════════════════════════════════════╝

✅ 环境变量已加载
API Key: AIzaSyD_0i...5LUN4
模型: gemini-2.0-flash-exp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 测试 1: 基本网络连接
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 可以连接到 Gemini API 服务器

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 测试 2: 简单 API 请求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ API 请求成功!
生成的文本: Hello! I'm Gemini...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 测试 3: 脚本生成（简化版）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 脚本生成成功!
耗时: 5234ms

生成的脚本:
[
  {
    "panelNumber": 1,
    "sceneDescription": "猫指着机器人...",
    "dialogue": "猫：什么是 Token？"
  },
  ...
]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 测试结果总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
网络连接: ✅ 通过
简单请求: ✅ 通过
脚本生成: ✅ 通过

╔════════════════════════════════════╗
║      ✅ 所有测试通过！              ║
╚════════════════════════════════════╝
```

### 失败的情况

```
❌ 无法连接到 Gemini API 服务器

可能的解决方案:
1. 检查网络连接
2. 配置代理（如果在大陆）:
   export HTTP_PROXY=http://127.0.0.1:7890
   export HTTPS_PROXY=http://127.0.0.1:7890
3. 使用 VPN 或其他网络工具
```

---

## 🔧 常见问题解决

### 问题 1: 网络超时

**你的错误：**
```
Error: Connect Timeout Error (attempted addresses: 142.250.73.138:443, ...)
```

**解决方案：**

#### 选项 A: 配置代理（推荐）
```bash
# 设置代理地址
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 重新测试
node test-gemini-api.js
```

#### 选项 B: 使用 VPN
1. 连接到可以访问 Google 的 VPN
2. 重新运行测试

#### 选项 C: 测试是否是网络问题
```bash
# 测试能否访问 Google
curl -I "https://www.google.com"

# 如果失败，说明需要代理或 VPN
```

---

### 问题 2: API Key 错误

**错误信息：**
```json
{
  "error": {
    "code": 401,
    "message": "API key invalid"
  }
}
```

**解决方案：**

1. **验证 API Key**
```bash
cat .env.local
# 应该看到: GEMINI_API_KEY=AIzaSy...
```

2. **重新获取 API Key**
```bash
# 运行配置脚本
./setup-gemini.sh

# 或手动访问
# https://makersuite.google.com/app/apikey
```

3. **检查是否复制完整**
   - API Key 通常 39 个字符
   - 以 `AIza` 开头
   - 没有额外的空格或换行

---

### 问题 3: 模型不存在

**错误信息：**
```json
{
  "error": {
    "code": 404,
    "message": "Model: 'xxx' not found"
  }
}
```

**解决方案：**

检查 `.env.local` 中的模型配置：
```bash
cat .env.local | grep MODEL
```

应该是以下之一：
```
GEMINI_SCRIPT_MODEL=gemini-2.0-flash-exp
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp
```

如果使用 `gemini-3-pro-preview`，请改为：
```bash
# 编辑 .env.local
GEMINI_SCRIPT_MODEL=gemini-2.0-flash-exp
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp
```

---

## 📁 文件清单

### 新增文件
```
test-gemini-api.sh          # Bash 测试脚本
test-gemini-api.js          # Node.js 测试脚本
TESTING_GUIDE.md            # 测试使用指南
```

### 相关文件
```
.env.local                  # 环境变量配置
setup-gemini.sh            # API Key 配置脚本
lib/utils/logger.ts        # 日志工具
lib/services/geminiService.ts  # Gemini 服务
```

---

## 🎯 测试工具对比

| 功能 | Bash | Node.js | curl |
|------|------|---------|------|
| 网络测试 | ✅ | ✅ | ✅ |
| API 测试 | ✅ | ✅ | ✅ |
| 脚本生成 | ✅ | ✅ | ❌ |
| 彩色输出 | ✅ | ✅ | ❌ |
| 错误分析 | ⚠️  | ✅ | ❌ |
| 性能计时 | ❌ | ✅ | ❌ |
| JSON 格式化 | ❌ | ✅ | ❌ |
| 依赖 | Bash | Node.js | curl |

**推荐：** Node.js 脚本（最完整）

---

## 📝 测试命令速查

```bash
# === 快速测试 ===
# 网络连接
curl -I "https://generativelanguage.googleapis.com"

# === 完整测试 ===
# Bash 脚本
./test-gemini-api.sh

# Node.js 脚本（推荐）
node test-gemini-api.js

# === 配置 ===
# 设置 API Key
./setup-gemini.sh

# 配置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# === 运行项目 ===
npm run dev
```

---

## ✅ 测试流程建议

### 第一次使用

1. **配置 API Key**
   ```bash
   ./setup-gemini.sh
   ```

2. **运行完整测试**
   ```bash
   node test-gemini-api.js
   ```

3. **启动项目**
   ```bash
   npm run dev
   ```

### 每次开发前

1. **快速测试**
   ```bash
   node test-gemini-api.js
   ```

2. **查看日志**
   ```bash
   npm run dev
   # 查看终端输出的日志
   ```

### 遇到问题时

1. **运行测试**
   ```bash
   node test-gemini-api.js
   ```

2. **查看详细日志**
   ```bash
   # 开发环境会自动输出详细日志
   npm run dev
   ```

3. **查看调试指南**
   ```bash
   cat GEMINI_API_DEBUG.md
   cat LOGGING_GUIDE.md
   ```

---

## 🎊 总结

现在你有 **3 种方式**测试 Gemini API：

1. **curl** - 快速验证网络
2. **Bash 脚本** - 自动化基础测试
3. **Node.js 脚本** - 完整详细测试（推荐）

**推荐命令：**
```bash
# 完整测试
node test-gemini-api.js

# 如果网络问题，先配置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 然后再测试
node test-gemini-api.js
```

测试通过后，就可以正常使用漫画生成功能了！🎨✨

---

*完成时间：2025-12-31*
*版本：v1.0.0*
*状态：✅ 完成*
