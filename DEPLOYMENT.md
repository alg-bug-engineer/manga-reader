# Manga Reader 生产环境部署指南

## 📋 目录

- [快速开始](#快速开始)
- [部署方式对比](#部署方式对比)
- [完整部署流程](#完整部署流程)
- [日常运维](#日常运维)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)

---

## 🚀 快速开始

### 一键部署（推荐）

```bash
cd /Users/zql_minii/ai-project/manga-reader
./deploy.sh
```

### 手动部署

```bash
# 1. 停止旧进程
pm2 delete manga-reader

# 2. 安装依赖
npm ci

# 3. 构建项目
NODE_ENV=production npm run build

# 4. 启动应用
pm2 start ecosystem.config.js --env production

# 5. 保存配置
pm2 save
```

---

## 📊 部署方式对比

### ❌ 错误的方式（你之前使用的）

```bash
pm2 start "npm run dev -- -p 4000" --name manga-reader
```

**问题：**
- 使用开发模式 (`next dev`)
- 没有代码压缩和优化
- 占用内存高
- 不支持热更新（仅文件监听）
- 性能差、不安全

### ✅ 正确的方式（现在推荐）

```bash
./deploy.sh
```

**优势：**
- ✅ 生产模式 (`next start`)
- ✅ 代码已构建优化
- ✅ 内存占用低
- ✅ 支持集群模式
- ✅ 自动重启和日志管理
- ✅ 性能好、更稳定

---

## 📦 完整部署流程

### 1. 环境准备

确保服务器环境满足要求：

```bash
# Node.js 版本检查
node --version  # 应该 >= 18.17.0

# npm 版本检查
npm --version   # 应该 >= 9.0.0

# PM2 安装（如果未安装）
npm install -g pm2
```

### 2. 配置环境变量

```bash
cd /Users/zql_minii/ai-project/manga-reader

# 复制环境变量模板
cp .env.example .env.production

# 编辑生产环境配置
vim .env.production
```

**关键配置项：**
```env
# 站点 URL（必须配置）
NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
NEXT_PUBLIC_SITE_URL=https://manga.ai-knowledgepoints.cn

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-64-character-random-string-here

# Gemini API Key
GEMINI_API_KEY=your-api-key-here
```

### 3. 构建和部署

```bash
# 使用部署脚本
./deploy.sh

# 或使用管理脚本
./manage.sh deploy
```

### 4. 验证部署

```bash
# 查看应用状态
./manage.sh status

# 查看日志
./manage.sh logs

# 测试访问
curl http://localhost:4000
```

---

## 🛠 日常运维

### 快捷管理命令

使用 `manage.sh` 脚本进行日常管理：

```bash
# 启动应用
./manage.sh start

# 停止应用
./manage.sh stop

# 重启应用
./manage.sh restart

# 平滑重启（零停机）
./manage.sh reload

# 查看日志
./manage.sh logs

# 查看状态
./manage.sh status

# 实时监控
./manage.sh monit

# 清理日志
./manage.sh clean
```

### PM2 原生命令

```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 show manga-reader

# 查看实时日志
pm2 logs manga-reader

# 查看日志（最后 100 行）
pm2 logs manga-reader --lines 100

# 清空日志
pm2 flush

# 重启应用
pm2 restart manga-reader

# 停止应用
pm2 stop manga-reader

# 删除应用
pm2 delete manga-reader

# 保存进程列表
pm2 save

# 监控面板
pm2 monit
```

### 更新代码

```bash
# 拉取最新代码
git pull

# 重新部署
./manage.sh deploy

# 或使用快速更新（仅重新构建和重启）
./manage.sh update
```

---

## ⚡ 性能优化

### 已实施的优化

#### 1. Next.js 配置优化 (`next.config.ts`)

```typescript
{
  compress: true,              // 启用 gzip 压缩
  poweredByHeader: false,      // 隐藏 X-Powered-By 头
  output: 'standalone',        // 优化部署体积
  swcMinify: true,            // 使用 SWC 压缩
  productionBrowserSourceMaps: false,  // 禁用 source map
}
```

#### 2. PM2 集群模式

```javascript
// ecosystem.config.js
{
  instances: 1,          // 可根据 CPU 核心数调整
  exec_mode: 'cluster',  // 集群模式
  max_memory_restart: '1G',  // 内存限制
}
```

#### 3. 图片加载优化

- 批量 Token 预加载
- 智能重试机制（5 次，指数退避）
- 错误分类处理

### 进一步优化建议

#### 1. 启用多进程集群

根据服务器 CPU 核心数调整：

```javascript
// ecosystem.config.js
const os = require('os');

{
  instances: os.cpus().length,  // 使用所有 CPU 核心
  exec_mode: 'cluster',
}
```

#### 2. 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name manga.ai-knowledgepoints.cn;

    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name manga.ai-knowledgepoints.cn;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:4000;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }
}
```

#### 3. 配置 CDN

对于静态资源（图片、CSS、JS），建议使用 CDN：
- 阿里云 CDN
- 腾讯云 CDN
- Cloudflare

#### 4. 数据库优化

如果使用数据库，考虑：
- 添加连接池
- 启用查询缓存
- 创建索引

---

## 📊 监控和日志

### 日志位置

```
manga-reader/
├── logs/
│   ├── err.log      # 错误日志
│   └── out.log      # 输出日志
└── .pm2/            # PM2 运行时文件
```

### 日志轮转

PM2 自动进行日志轮转：
- 单个日志文件最大 10MB
- 保留最近 5 个日志文件

### 实时监控

```bash
# PM2 监控面板
pm2 monit

# 或使用管理脚本
./manage.sh monit
```

### 健康检查

创建健康检查脚本：

```bash
#!/bin/bash
# health-check.sh

response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000)

if [ $response -eq 200 ]; then
    echo "✅ 应用正常"
    exit 0
else
    echo "❌ 应用异常 (HTTP $response)"
    pm2 restart manga-reader
    exit 1
fi
```

添加到 crontab：

```bash
# 每 5 分钟检查一次
*/5 * * * * /path/to/manga-reader/health-check.sh
```

---

## 🔧 故障排查

### 常见问题

#### 1. 应用无法启动

**检查：**
```bash
# 查看详细错误
pm2 logs manga-reader --err

# 检查端口占用
lsof -i :4000

# 检查环境变量
cat .env.production
```

**解决：**
- 确保端口 4000 未被占用
- 检查 `.env.production` 配置是否正确
- 检查 Node.js 版本是否满足要求

#### 2. 内存占用过高

**检查：**
```bash
# 查看内存使用
pm2 monit

# 或查看详细信息
pm2 show manga-reader
```

**解决：**
- 在 `ecosystem.config.js` 中降低 `max_memory_restart`
- 减少集群实例数
- 检查是否有内存泄漏

#### 3. 图片加载失败

**检查：**
```bash
# 查看浏览器控制台错误
# 查看应用日志
pm2 logs manga-reader | grep -i image
```

**解决：**
- 检查图片路径是否正确
- 验证 Token 生成逻辑
- 查看移动端网络日志

#### 4. 构建失败

**检查：**
```bash
# 清理缓存
rm -rf .next
rm -rf node_modules

# 重新安装依赖
npm ci

# 重新构建
npm run build
```

### 调试模式

启动调试模式：

```bash
# 停止生产环境
pm2 stop manga-reader

# 开发模式运行（带调试）
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

---

## 📱 移动端优化总结

已实施的移动端优化：

1. **批量 Token 预加载** - 减少网络请求
2. **智能重试机制** - 5 次重试，指数退避
3. **详细错误提示** - 用户友好的错误信息
4. **图片缓存优化** - 5 分钟缓存
5. **网络容错** - 处理各种网络错误

---

## 🔄 更新和维护

### 定期更新

```bash
# 每周更新依赖
npm update

# 检查安全漏洞
npm audit

# 修复安全漏洞
npm audit fix
```

### 备份策略

```bash
# 备份数据目录
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# 备份配置文件
cp .env.production .env.production.backup
```

### 版本回滚

```bash
# 查看历史版本
git log --oneline

# 回滚到指定版本
git checkout <commit-hash>
./manage.sh deploy
```

---

## 📞 支持

遇到问题？

1. 查看日志：`./manage.sh logs`
2. 查看状态：`./manage.sh status`
3. 查看文档：本 README
4. 提交 Issue：GitHub Issues

---

## ✅ 部署检查清单

部署前检查：

- [ ] Node.js 版本 >= 18.17.0
- [ ] 环境变量已配置（`.env.production`）
- [ ] JWT_SECRET 已修改为强随机字符串
- [ ] `NEXT_PUBLIC_BASE_URL` 已配置为实际域名
- [ ] 端口 4000 未被占用
- [ ] PM2 已全局安装
- [ ] 日志目录已创建

部署后验证：

- [ ] 应用状态正常
- [ ] 日志无错误
- [ ] 网站可访问
- [ ] 图片加载正常
- [ ] 移动端测试通过
- [ ] PM2 配置已保存
- [ ] 开机自启已配置

---

**部署完成后，你的应用将运行在 `http://localhost:4000`**
