# 🔧 紧急修复指南 - 服务器端

## 问题：找不到生产构建文件

错误信息：
```
Could not find a production build in the '.next' directory
```

## 解决方案（3 步）

### 方式 1：使用快速修复脚本（推荐）

```bash
cd /root/manga-reader

# 上传并运行快速修复脚本
bash quick-fix.sh
```

### 方式 2：手动修复

```bash
cd /root/manga-reader

# 1. 停止失败进程
pm2 delete manga-reader

# 2. 安装类型定义包（关键！）
npm install --save-dev @types/jsonwebtoken @types/bcryptjs

# 3. 清理并重新构建
rm -rf .next
NODE_ENV=production npm run build

# 4. 验证构建产物
ls -la .next/BUILD_ID  # 确保这个文件存在

# 5. 启动应用
pm2 start ecosystem.config.js --env production

# 6. 检查状态
pm2 status
pm2 logs manga-reader
```

---

## 📋 完整步骤详解

### 第 1 步：停止失败的进程

```bash
pm2 delete manga-reader
```

### 第 2 步：安装缺失的类型定义

**这是问题的关键！** TypeScript 编译失败导致构建不完整。

```bash
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### 第 3 步：清理并重新构建

```bash
# 清理旧的构建文件
rm -rf .next

# 重新构建
NODE_ENV=production npm run build
```

**预期输出：**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 第 4 步：验证构建产物

```bash
# 检查关键文件是否存在
ls -la .next/BUILD_ID
ls -la .next/server
```

如果 `.next/BUILD_ID` 不存在，说明构建失败了。

### 第 5 步：启动应用

```bash
# 启动
pm2 start ecosystem.config.js --env production

# 等待 3 秒
sleep 3

# 检查状态
pm2 status

# 查看日志
pm2 logs manga-reader
```

### 第 6 步：测试访问

```bash
# 本地测试
curl http://localhost:4000

# 或查看进程信息
pm2 describe manga-reader
```

---

## 🔍 如果构建失败

### 查看详细错误

```bash
# 查看构建日志
npm run build 2>&1 | tee build.log

# 查看错误部分
cat build.log | grep -A 10 "error"
```

### 常见问题

#### 问题 1：类型定义错误

```bash
Type error: Could not find a declaration file for module 'jsonwebtoken'
```

**解决：**
```bash
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

#### 问题 2：内存不足

```bash
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**解决：**
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```

#### 问题 3：端口被占用

```bash
Error: listen EADDRINUSE: address already in use :::4000
```

**解决：**
```bash
# 查找占用端口的进程
lsof -i :4000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
# 修改 ecosystem.config.js 中的端口号
```

---

## ✅ 成功标志

当你看到以下输出，说明修复成功：

```bash
$ pm2 status
┌────┬──────────────┬──────────┬──────────┐
│ id │ name         │ status   │ cpu      │
├────┼──────────────┼──────────┼──────────┤
│ 0  │ manga-reader │ online   │ 0%       │
└────┴──────────────┴──────────┴──────────┘

$ curl http://localhost:4000
<!DOCTYPE html>  # HTML 内容
```

---

## 📞 如果还是不行

1. **完整日志：**
   ```bash
   pm2 logs manga-reader --lines 100
   ```

2. **系统资源：**
   ```bash
   free -h      # 内存
   df -h        # 磁盘
   top          # CPU
   ```

3. **Node.js 版本：**
   ```bash
   node --version  # 应该 >= 18.17.0
   npm --version   # 应该 >= 9.0.0
   ```

4. **重新安装依赖：**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

---

## 🎯 预防措施

为了避免未来出现同样问题：

### 1. 使用正确的部署脚本

```bash
# 使用改进后的部署脚本
./deploy.sh
```

新脚本会自动：
- 检查构建产物
- 验证构建成功
- 检查应用状态

### 2. 本地测试后再部署

在本地先测试构建：

```bash
# 在本地
npm run build

# 如果成功，再部署到服务器
git push
# 在服务器上
git pull
./deploy.sh
```

### 3. 使用 PM2 监控

```bash
# 设置健康检查
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

**快速修复命令（复制粘贴）：**

```bash
cd /root/manga-reader && \
pm2 delete manga-reader && \
npm install --save-dev @types/jsonwebtoken @types/bcryptjs && \
rm -rf .next && \
NODE_ENV=production npm run build && \
pm2 start ecosystem.config.js --env production && \
pm2 save && \
pm2 status
```
