# 漫画网站安全防护部署指南

## 概述

本网站实现了多层次的安全防护机制,防止漫画图片被恶意下载。以下是主要的安全特性:

### 已实现的安全功能

1. **用户认证系统**
   - 密码使用 bcrypt 哈希存储
   - JWT Token 双重验证(Session + JWT)
   - 登录/注册频率限制

2. **图片访问保护**
   - Referer 防盗链检查
   - 访问 Token 验证(5分钟有效期)
   - IP 访问频率限制(每分钟100次)
   - 路径遍历攻击防护

3. **图片水印** (可选)
   - 平铺水印支持
   - 用户个性化水印
   - 通过环境变量启用

4. **前端防护**
   - 禁用右键菜单
   - 禁用拖拽保存
   - 禁用长按保存(移动端)
   - CSS 防护样式

5. **日志监控**
   - 访问日志记录
   - 安全事件日志
   - 可疑行为告警
   - 自动日志轮转(7天)

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

主要依赖:
- bcryptjs - 密码哈希
- jsonwebtoken - JWT Token
- sharp - 图片处理和水印

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`:

```bash
cp .env.example .env.local
```

编辑 `.env.local` 并填入以下关键配置:

```bash
# JWT 密钥(生产环境必须使用强随机字符串)
JWT_SECRET=your-production-secret-key-at-least-64-characters-long

# 站点URL(修改为你的实际域名)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# 是否启用图片水印(可选)
ENABLE_WATERMARK=true
```

**生成强密钥的方法:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 构建项目

```bash
npm run build
```

### 4. 阿里云 ECS 部署

#### 方案 A: 使用 PM2 守护进程(推荐)

1. **安装 PM2**
```bash
npm install -g pm2
```

2. **启动应用**
```bash
pm2 start npm --name "manga-reader" -- start
```

3. **配置开机自启动**
```bash
pm2 startup
pm2 save
```

4. **常用命令**
```bash
pm2 list              # 查看进程列表
pm2 logs manga-reader # 查看日志
pm2 restart manga-reader  # 重启
pm2 stop manga-reader     # 停止
```

#### 方案 B: 使用 Systemd 服务

创建 `/etc/systemd/system/manga-reader.service`:

```ini
[Unit]
Description=Manga Reader Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/manga-reader
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
sudo systemctl daemon-reload
sudo systemctl enable manga-reader
sudo systemctl start manga-reader
```

### 5. 配置 Nginx 反向代理

创建 Nginx 配置 `/etc/nginx/sites-available/manga-reader`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 强制 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/manga-reader-access.log;
    error_log /var/log/nginx/manga-reader-error.log;

    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # 客户端上传大小限制
    client_max_body_size 10M;
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/manga-reader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 配置防火墙

```bash
# 开放 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 7. 配置 SSL 证书

使用 Let's Encrypt 免费证书:

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 安全检查清单

部署后请确认以下安全措施:

- [ ] 修改了 JWT_SECRET 为强随机字符串
- [ ] 配置了正确的站点URL
- [ ] 启用了 HTTPS (SSL证书)
- [ ] 配置了防火墙,只开放必要端口
- [ ] 启用了图片水印 (可选)
- [ ] 设置了日志定期清理
- [ ] 限制了登录尝试频率
- [ ] 数据目录权限正确设置

## 监控和维护

### 查看访问日志

```bash
# 图片访问日志
tail -f data/access-logs.jsonl

# 安全事件日志
tail -f data/security-logs.jsonl
```

### 性能监控

使用 PM2 监控:
```bash
pm2 monit
```

### 定期备份

备份重要数据:
```bash
# 备份数据目录
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# 备份数据库(JSON文件)
cp data/*.json backup/
```

## 故障排查

### 图片加载失败

1. 检查 Token 是否正确生成
2. 确认 Referer 是否来自本站
3. 检查频率限制是否触发
4. 查看安全日志中的错误信息

### 登录失败

1. 检查密码是否正确哈希
2. 确认 Session 是否正确设置
3. 查看登录频率限制
4. 检查 JWT_SECRET 配置

### 性能问题

1. 考虑使用 Redis 代替内存存储频率限制
2. 启用图片缓存
3. 考虑使用 CDN
4. 优化图片大小

## 常见问题

**Q: 为什么图片还是可以右键保存?**

A: 前端防护只能阻止普通用户,技术用户仍然可以通过浏览器开发者工具获取。真正的保护在于后端的 Token 验证和 Referer 检查,这能防止直接链接和批量下载。

**Q: Token 5分钟过期是否太短?**

A: 这是安全性和用户体验的平衡。你可以修改 `lib/security/crypto.ts` 中的 `generateImageToken` 函数调整有效期。

**Q: 如何禁用某些安全检查?**

A: 可以编辑 `app/api/images/[...path]/route.ts`,注释掉相应的检查逻辑。但不建议这样做。

**Q: 生产环境建议使用什么配置?**

A: 建议启用所有安全功能,包括水印、频率限制、日志监控。使用强密码和强 JWT 密钥。配置 HTTPS 和防火墙。

## 联系支持

如有问题,请查看:
- 项目文档
- 日志文件
- GitHub Issues
