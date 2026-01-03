# 🚀 服务器部署修复指南

## 问题诊断

从你的错误日志可以看到，有两个关键问题：

### 问题 1: 硬编码的本地路径

```javascript
// ecosystem.config.js 中有错误的路径
cwd: '/Users/zql_minii/ai-project/manga-reader',  // ❌ 错误！
error_file: './logs/err.log',  // ❌ 相对路径可能错误
```

### 问题 2: PM2 配置问题

- 使用了 `cluster` 模式（Next.js 生产环境应该用 `fork`）
- 使用了 `wait_ready: true`（Next.js 不支持）

---

## ✅ 解决方案

### 第 1 步：上传修复后的文件到服务器

在**本地**执行：

```bash
# 1. 上传修复后的 ecosystem.config.js
scp /Users/zql_minii/ai-project/manga-reader/ecosystem.config.js \
    root@your-server:/root/manga-reader/

# 2. 上传修复脚本
scp /Users/zql_minii/ai-project/manga-reader/server-fix.sh \
    root@your-server:/root/manga-reader/

# 3. 上传改进的部署脚本
scp /Users/zql_minii/ai-project/manga-reader/deploy.sh \
    root@your-server:/root/manga-reader/
```

### 第 2 步：在服务器上执行修复

SSH 到服务器：

```bash
ssh root@your-server
```

然后执行：

```bash
cd /root/manga-reader

# 给脚本添加执行权限
chmod +x server-fix.sh

# 运行修复脚本
bash server-fix.sh
```

---

## 📋 修复后的 ecosystem.config.js

新的配置文件已经修复：

```javascript
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'manga-reader',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',

      // ✅ 使用动态路径，自动适应当前目录
      cwd: path.resolve(__dirname),

      // ✅ 使用 fork 模式（更稳定）
      exec_mode: 'fork',

      // ✅ 使用绝对路径存储日志
      error_file: path.join(__dirname, 'logs', 'err.log'),
      out_file: path.join(__dirname, 'logs', 'out.log'),

      // ✅ 移除了 wait_ready（Next.js 不支持）
      autorestart: true,
      max_memory_restart: '1G',
      // ... 其他配置
    },
  ],
};
```

---

## 🔍 如果还是有问题

### 检查当前配置

在服务器上执行：

```bash
cd /root/manga-reader

# 查看配置文件内容
cat ecosystem.config.js

# 检查是否还有硬编码路径
grep -n "Users/zql_minii" ecosystem.config.js
```

如果还有硬编码路径，手动编辑：

```bash
vim ecosystem.config.js
```

找到并修改：

```javascript
// 从这个：
cwd: '/Users/zql_minii/ai-project/manga-reader',

// 改为：
cwd: path.resolve(__dirname),
```

### 手动启动测试

如果脚本还是失败，手动测试：

```bash
cd /root/manga-reader

# 1. 停止所有 PM2 进程
pm2 delete all

# 2. 清理日志
rm -rf logs/*.log

# 3. 手动启动 Next.js（测试）
NODE_ENV=production PORT=4000 npx next start -p 4000

# 如果上面成功，按 Ctrl+C 停止，然后用 PM2 启动
pm2 start ecosystem.config.js --env production

# 4. 查看日志
pm2 logs manga-reader
```

---

## 🎯 预期成功输出

修复成功后，你应该看到：

```bash
$ bash server-fix.sh
==========================================
🔧 服务器端修复 - manga-reader
==========================================

当前目录: /root/manga-reader
检查 .next 目录:
  ✅ BUILD_ID 存在

🛑 步骤 1: 完全停止 PM2 进程...
✅ PM2 已停止

🔍 步骤 2: 验证构建产物...
✅ 构建产物完整

🧹 步骤 3: 清空旧日志...
✅ 日志已清空

📋 步骤 4: 验证配置文件...
✅ 配置文件正确

🚀 步骤 5: 启动应用...
[PM2] Starting /root/manga-reader/ecosystem.config.js
✅ 应用状态: online

🌐 步骤 7: 测试访问...
✅ 应用可以访问

==========================================
✅ 修复完成！
==========================================
```

---

## 📊 验证修复

### 1. 检查 PM2 状态

```bash
pm2 status

# 应该看到：
# ┌────┬──────────────┬──────────┐
# │ id │ name         │ status   │
# ├────┼──────────────┼──────────┤
# │ 0  │ manga-reader │ online   │
# └────┴──────────────┴──────────┘
```

### 2. 查看日志

```bash
# 查看实时日志
pm2 logs manga-reader

# 查看日志文件
cat /root/manga-reader/logs/err.log
cat /root/manga-reader/logs/out.log
```

### 3. 测试访问

```bash
# 本地测试
curl http://localhost:4000

# 应该返回 HTML 内容

# 或使用浏览器访问
# http://your-server-ip:4000
```

---

## 🔧 关键修复点总结

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| cwd 路径 | 硬编码本地路径 | `path.resolve(__dirname)` |
| 日志路径 | 相对路径 | `path.join(__dirname, 'logs', ...)` |
| exec_mode | cluster（不稳定） | fork（稳定） |
| wait_ready | true（不兼容） | 移除 |
| 错误日志 | 指向错误目录 | `/root/manga-reader/logs/` |

---

## 🚀 一键命令（复制粘贴）

如果不想上传文件，可以直接在服务器上执行：

```bash
cd /root/manga-reader && \
cat > ecosystem.config.js << 'EOF'
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'manga-reader',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      cwd: path.resolve(__dirname),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: path.join(__dirname, 'logs', 'err.log'),
      out_file: path.join(__dirname, 'logs', 'out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_file_size: 10485760,
      log_file_count: 5,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
EOF
pm2 delete manga-reader 2>/dev/null; \
mkdir -p logs && \
rm -f logs/*.log && \
pm2 start ecosystem.config.js --env production && \
sleep 5 && \
pm2 save && \
pm2 status && \
pm2 logs manga-reader --lines 20
```

这个命令会：
1. 创建正确的 `ecosystem.config.js`
2. 停止旧进程
3. 清理日志
4. 启动应用
5. 保存配置
6. 显示状态和日志

---

**修复完成后，你的应用就运行在 `http://localhost:4000` 了！** 🎉
