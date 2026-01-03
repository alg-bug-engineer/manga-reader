# ========================================
# 部署到阿里ECS - 完整部署指南
# ========================================

## 📋 问题清单

### ✅ 已解决的问题
1. ✅ 图片403错误 - 环境变量配置
2. ✅ Referer检查 - 增加容错性

### ⚠️  需要注意的问题
3. ⚠️ Google Fonts下载失败 - 阿里ECS网络限制

---

## 🚀 快速部署步骤

### 1. 上传代码到服务器

```bash
# 在本地打包项目
cd /Users/zql_minii/ai-project/manga-reader
tar -czf manga-reader.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# 上传到服务器
scp manga-reader.tar.gz root@your-server-ip:/root/

# 或使用rsync
rsync -avz --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  /Users/zql_minii/ai-project/manga-reader/ \
  root@your-server-ip:/root/manga-reader/
```

### 2. 服务器上配置环境变量

```bash
# SSH登录服务器
ssh root@your-server-ip

# 进入项目目录
cd /root/manga-reader

# 复制生产环境配置
cp .env.production .env.local

# ⚠️ 编辑.env.local,确认以下配置:
# NEXT_PUBLIC_BASE_URL=https://manga.ai-knowledgepoints.cn
# NEXT_PUBLIC_SITE_URL=https://manga.ai-knowledgepoints.cn
# JWT_SECRET=修改为随机64位字符串
```

**生成JWT密钥**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. 安装依赖并构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 测试启动
npm run dev -- -p 4000
```

### 4. 配置Nginx

```bash
# 复制Nginx配置
cp nginx.conf.example /etc/nginx/sites-available/manga-reader

# 编辑配置,修改域名和SSL证书路径
nano /etc/nginx/sites-available/manga-reader

# 创建软链接
sudo ln -s /etc/nginx/sites-available/manga-reader /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 5. 使用PM2守护进程

```bash
# 安装PM2
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'manga-reader',
    script: 'node_modules/.bin/next',
    args: 'start -p 4000',
    cwd: '/root/manga-reader',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/root/manga-reader/logs/error.log',
    out_file: '/root/manga-reader/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# 创建日志目录
mkdir -p /root/manga-reader/logs

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的提示

# 查看日志
pm2 logs manga-reader
```

---

## 🔧 解决Google Fonts问题

### 方案1: 使用国内CDN镜像 (推荐)

编辑 `app/layout.tsx`:
```typescript
// 将Google字体替换为阿里CDN或360CDN
// 或直接使用系统字体回退
```

### 方案2: 忽略警告(字体会回退到系统字体)

Google Fonts警告**不影响功能**,系统会自动使用fallback字体:
- Outfit → 系统sans-serif
- JetBrains Mono → 系统monospace
- Manrope → 系统sans-serif
- Noto Sans SC → 系统中文字体

### 方案3: 下载字体到本地

```bash
# 如果需要,可以下载字体到public/fonts目录
# 然后修改font配置使用本地字体
```

---

## 🧪 验证部署

### 1. 检查Next.js进程

```bash
pm2 status
pm2 logs manga-reader --lines 50
```

### 2. 检查Nginx状态

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/manga-reader-error.log
```

### 3. 测试图片API

```bash
# 在服务器上测试
curl -I http://localhost:4000/api/images/xxx/xxx.jpg

# 检查Referer是否正确
curl -I -H "Referer: https://manga.ai-knowledgepoints.cn" \
  http://localhost:4000/api/images/xxx/xxx.jpg
```

### 4. 浏览器测试

访问: https://manga.ai-knowledgepoints.cn

打开浏览器控制台,检查:
- ✅ 图片是否正常加载
- ✅ 网络请求状态
- ✅ Console是否有错误

---

## 🐛 故障排查

### 图片403错误

**检查清单**:
1. ✅ `.env.local` 中 `NEXT_PUBLIC_BASE_URL` 是否为生产域名
2. ✅ Nginx配置中 `proxy_set_header Referer $http_referer;`
3. ✅ 重启Next.js: `pm2 restart manga-reader`
4. ✅ 检查环境变量: `pm2 env 0 | grep NEXT_PUBLIC`

### 图片401错误

**原因**: Token验证失败
**解决**: 已通过修改 `isValidReferer` 增加容错性

### Nginx 502错误

**原因**: Next.js未启动或端口错误
**解决**:
```bash
pm2 status
netstat -tuln | grep 4000
```

---

## 📊 性能优化建议

### 1. 开启缓存

Nginx配置已包含静态资源缓存

### 2. 使用CDN

建议将静态资源和图片上传到阿里OSS并配置CDN

### 3. 数据库优化

如果有大量用户,考虑使用PostgreSQL替代JSON文件存储

---

## 🔒 安全建议

1. ✅ 使用强密码和JWT密钥
2. ✅ 启用HTTPS (Let's Encrypt免费证书)
3. ✅ 配置防火墙
4. ✅ 定期更新依赖包
5. ✅ 配置fail2ban防止暴力破解

---

## 📞 快速命令参考

```bash
# 重启应用
pm2 restart manga-reader

# 查看日志
pm2 logs manga-reader

# 重载Nginx
sudo nginx -s reload

# 检查端口占用
netstat -tuln | grep 4000

# 测试Nginx配置
sudo nginx -t

# 查看Next.js进程
ps aux | grep next
```
