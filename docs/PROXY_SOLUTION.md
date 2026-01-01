# 🔧 Node.js 代理问题解决方案

## 问题分析

### 为什么 Bash 脚本可以，Node.js 不行？

**Bash 脚本（使用 curl）：**
```bash
curl "https://..."
```
- ✅ `curl` 会**自动读取**系统代理设置
- ✅ 支持环境变量：`HTTP_PROXY`、`HTTPS_PROXY`
- ✅ 可以使用系统配置的代理

**Node.js 原生 https 模块：**
```javascript
https.request("https://...")
```
- ❌ **不会自动读取**系统代理
- ❌ **不会**读取环境变量 `HTTP_PROXY`
- ❌ 需要手动配置代理

---

## 解决方案

### 方案 1: 设置环境变量（最简单）

```bash
# 设置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 然后运行 Node.js 脚本
node test-gemini-api.js
```

**优点：** 简单，不需要修改代码
**缺点：** 每次都需要设置

---

### 方案 2: 使用支持代理的脚本（推荐）

我已经创建了支持代理的版本：`test-gemini-api-proxy.js`

```bash
# 1. 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 2. 运行支持代理的测试脚本
node test-gemini-api-proxy.js
```

这个脚本会：
- ✅ 自动检测 `HTTP_PROXY` 环境变量
- ✅ 自动配置代理
- ✅ 如果没有代理，直连

---

### 方案 3: 安装代理支持库

```bash
# 安装 https-proxy-agent
npm install https-proxy-agent --save-dev
```

然后在代码中使用：

```javascript
const HttpsProxyAgent = require('https-proxy-agent');

const agent = new HttpsProxyAgent('http://127.0.0.1:7890');

https.request(url, { agent }, callback);
```

---

## 快速使用

### 步骤 1: 设置代理

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

**注意：** 将 `7890` 改成你实际的代理端口

### 步骤 2: 运行测试

```bash
# 使用支持代理的脚本
node test-gemini-api-proxy.js
```

### 步骤 3: 启动项目

```bash
# 同样的代理设置对 npm run dev 也有效
npm run dev
```

---

## 永久配置代理

### 方式 1: 添加到 shell 配置

编辑 `~/.zshrc`（Mac）或 `~/.bashrc`（Linux）：

```bash
# 添加以下内容
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

然后重新加载配置：

```bash
source ~/.zshrc
```

### 方式 2: 创建启动脚本

创建 `start-dev.sh`：

```bash
#!/bin/bash

# 设置代理
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 启动开发服务器
npm run dev
```

然后：

```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## 对比总结

| 方法 | Bash curl | Node.js 原生 | Node.js + 代理库 |
|------|-----------|--------------|-----------------|
| 自动使用系统代理 | ✅ | ❌ | ✅ |
| 支持 HTTP_PROXY | ✅ | ❌ | ✅ |
| 需要额外配置 | ❌ | ❌ | ⚠️  环境变量 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 你的情况

从你的测试结果看：

**Bash 脚本：** ✅ 成功
- 说明你的代理配置是正确的
- curl 可以正常访问 Gemini API

**Node.js 脚本：** ❌ 失败
- 因为 Node.js 没有使用代理

**解决方案：**

```bash
# 1. 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 2. 重新测试
node test-gemini-api-proxy.js

# 3. 如果测试通过，启动项目
npm run dev
```

---

## 常见代理端口

根据不同的代理工具，端口可能不同：

| 工具 | 默认端口 |
|------|---------|
| Clash | 7890 |
| V2Ray | 10808 |
| Shadowsocks | 1080 |
| Surge | 6153 |

如果你的代理端口不是 7890，请修改：

```bash
export HTTP_PROXY=http://127.0.0.1:你的端口
export HTTPS_PROXY=http://127.0.0.1:你的端口
```

---

## 总结

**问题：** Node.js 不会自动使用系统代理
**原因：** 需要手动配置或使用代理库
**解决：** 设置 `HTTP_PROXY` 环境变量

**最快命令：**
```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
node test-gemini-api-proxy.js
```

这样 Node.js 脚本就可以和 Bash 脚本一样正常工作了！🎉

---

*更新时间：2025-12-31*
