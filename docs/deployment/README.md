# 部署指南

> **芝士AI吃鱼 - AI知识科普漫画阅读平台**
> **更新**: 2025-12-30

---

## 📋 部署选项概览

芝士AI吃鱼支持多种部署方式，选择最适合你的：

- ⭐ **Vercel** (推荐) - 零配置，自动部署，免费额度
- 🟢 **阿里云 ECS** - 国内用户推荐，稳定快速
- 🐳 **Docker** - 容器化部署，易于迁移
- 🖥️ **Node.js** - 直接运行，最简单

---

## ⭐ Vercel 部署（推荐）

### 优点
- ✅ 零配置，自动检测 Next.js
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ Git 集成，推送即部署
- ✅ 免费额度充足

### 步骤

#### 1. 推送代码到 GitHub

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后
git remote add origin https://github.com/your-username/manga-reader.git
git push -u origin main
```

#### 2. 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入你的 `manga-reader` 仓库
5. 点击 "Deploy"

#### 3. 等待部署完成

Vercel 会自动：
- 检测 Next.js
- 安装依赖
- 构建项目
- 部署到全球 CDN

#### 4. 访问你的网站

部署完成后，你会得到一个 `.vercel.app` 域名，例如：
```
https://manga-reader.vercel.app
```

### 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 根据提示配置 DNS 记录
3. Vercel 会自动签发 SSL 证书

### 环境变量（如需要）

在 Vercel 项目设置中添加：

```bash
# 如果使用外部数据库
DATABASE_URL=your-database-url

# 如果使用阿里云 OSS
OSS_REGION=your-region
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret
OSS_BUCKET=your-bucket
```

---

## 🟢 阿里云 ECS 部署

### 适用场景
- 需要国内服务器
- 需要完全控制服务器
- 已有 ECS 实例

### 前置要求

- 阿里云 ECS 实例
- 域名（可选）
- Node.js 18+

### 方法一：直接运行 Node.js

#### 1. 连接到 ECS

```bash
ssh root@your-ecs-ip
```

#### 2. 安装 Node.js

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 3. 上传项目代码

**本地执行**:
```bash
# 打包项目（排除 node_modules）
tar -czf manga-reader.tar.gz --exclude=node_modules --exclude=.next .

# 上传到服务器
scp manga-reader.tar.gz root@your-ecs-ip:/root/
```

**服务器执行**:
```bash
# 解压
cd /root
tar -xzf manga-reader.tar.gz
cd manga-reader
```

#### 4. 安装依赖并构建

```bash
npm install
npm run build
```

#### 5. 使用 PM2 保持运行

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "manga-reader" -- start

# 查看日志
pm2 logs manga-reader

# 设置开机自启
pm2 startup
pm2 save
```

#### 6. 配置 Nginx 反向代理

**安装 Nginx**:
```bash
# CentOS
yum install nginx -y

# Ubuntu
apt install nginx -y
```

**创建配置文件**:
```bash
vim /etc/nginx/conf.d/manga-reader.conf
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**重启 Nginx**:
```bash
# 测试配置
nginx -t

# 重启
systemctl restart nginx

# 设置开机自启
systemctl enable nginx
```

#### 7. 配置防火墙

```bash
# 开放 80 和 443 端口
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

#### 8. 配置 SSL 证书（可选）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
yum install certbot python3-certbot-nginx -y

# 自动配置 SSL
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

---

### 方法二：使用 Docker

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. 更新 next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // 添加这行
  // ... 其他配置
};
```

#### 3. 构建并运行

```bash
# 构建镜像
docker build -t manga-reader .

# 运行容器
docker run -d \
  --name manga-reader \
  -p 3000:3000 \
  manga-reader

# 查看日志
docker logs -f manga-reader
```

#### 4. 使用 Docker Compose（推荐）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data  # 挂载数据目录
```

运行：
```bash
docker-compose up -d
```

---

## 🐳 Docker 部署（通用）

### 使用方法

#### 1. 构建镜像

```bash
docker build -t manga-reader .
```

#### 2. 运行容器

```bash
docker run -d \
  --name manga-reader \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  manga-reader
```

#### 3. 管理容器

```bash
# 查看日志
docker logs -f manga-reader

# 停止容器
docker stop manga-reader

# 启动容器
docker start manga-reader

# 删除容器
docker rm manga-reader

# 进入容器
docker exec -it manga-reader sh
```

---

## 🔧 部署后配置

### 数据备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /root/backup/manga-reader-$DATE.tar.gz /root/manga-reader/data
find /root/backup -name "manga-reader-*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# 添加定时任务（每天凌晨2点备份）
crontab -e
# 添加：0 2 * * * /root/backup.sh
```

### 性能优化

#### 启用 Gzip 压缩

在 `next.config.ts` 中：

```typescript
const nextConfig: NextConfig = {
  compress: true,  // 启用压缩
  // ...
};
```

#### 配置 CDN

将静态文件上传到阿里云 OSS 或腾讯云 COS：

```bash
# 安装阿里云 OSS SDK
npm install ali-oss

# 创建上传脚本
# 参考 lib/upload.ts
```

### 监控

使用 PM2 监控：

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs manga-reader

# 查看状态
pm2 status
```

---

## 🌐 域名配置

### DNS 设置

在你的域名提供商处添加以下记录：

```
类型: A
主机记录: @
记录值: your-ecs-ip

类型: CNAME
主机记录: www
记录值: your-domain.com
```

### 自动 HTTPS

使用 Let's Encrypt：

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🛡️ 安全建议

### 1. 配置防火墙

```bash
# 只开放必要端口
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload
```

### 2. 禁用 root 登录

```bash
vim /etc/ssh/sshd_config
# 修改：PermitRootLogin no
systemctl restart sshd
```

### 3. 更新系统

```bash
# CentOS
yum update -y

# Ubuntu
apt update && apt upgrade -y
```

### 4. 配置 SELinux（CentOS）

```bash
# 检查状态
sestatus

# 如果是 enforcing，设置为 permissive
setenforce 0
```

---

## 📊 性能优化

### 启用 HTTP/2

Nginx 配置：

```nginx
server {
    listen 443 ssl http2;
    # ...
}
```

### 配置缓存

```nginx
# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔄 更新部署

### Vercel

```bash
git add .
git commit -m "Update"
git push
```

Vercel 会自动部署。

### ECS/Docker

```bash
# 拉取最新代码
git pull

# 重新构建
npm run build

# 重启服务（PM2）
pm2 restart manga-reader

# 或 Docker
docker-compose down
docker-compose up -d --build
```

---

## 🐛 故障排查

### 常见问题

#### 1. 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

#### 2. 内存不足

```bash
# 检查内存
free -h

# 添加 swap
dd if=/dev/zero of=/swapfile bs=1024 count=2048k
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

#### 3. 构建失败

```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

---

## 📞 获取帮助

- 📖 查看 [文档中心](../README.md)
- 🐛 提交 [Issue](https://github.com/your-repo/manga-reader/issues)
- 💬 加入 [讨论区](https://github.com/your-repo/manga-reader/discussions)

---

**最后更新**: 2025-12-30
**文档版本**: v1.0
