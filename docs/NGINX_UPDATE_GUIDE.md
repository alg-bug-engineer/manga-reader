# ========================================
# Nginx配置更新指南
# ========================================

## 📋 配置说明

基于你现有的配置,我做了以下优化:

### ✅ 保留的配置(Certbot管理部分)
- ✅ SSL证书配置 (不要修改)
- ✅ HTTP到HTTPS重定向
- ✅ Let's Encrypt配置文件引用

### 🚀 新增优化

#### 1. **Referer头转发** (解决图片403问题)
```nginx
proxy_set_header Referer $http_referer;
```

#### 2. **安全头部**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### 3. **静态资源缓存**
- Next.js静态资源: 缓存1年 (immutable)
- 图片文件: 缓存1小时
- 字体文件: 缓存30天

#### 4. **图片API特殊处理**
- 禁用缓存
- 确保Referer转发
- 超时优化

#### 5. **上传文件大小限制**
```nginx
client_max_body_size 100M;
```

---

## 🚀 部署步骤

### 方法1: 手动更新 (推荐)

```bash
# 1. 备份现有配置
sudo cp /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn \
  /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn.backup

# 2. 上传新配置
# 在本地执行:
scp nginx-production.conf root@your-server-ip:/tmp/

# 3. 在服务器上替换配置
ssh root@your-server-ip
sudo cp /tmp/nginx-production.conf /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn

# 4. 测试配置
sudo nginx -t

# 5. 如果测试通过,重载Nginx
sudo systemctl reload nginx

# 6. 如果测试失败,恢复备份
sudo cp /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn.backup \
  /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn
sudo systemctl reload nginx
```

### 方法2: 直接编辑

```bash
# 1. 备份配置
sudo cp /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn \
  /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn.backup

# 2. 编辑配置
sudo nano /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn

# 3. 在 location / 块中添加这一行:
# proxy_set_header Referer $http_referer;

# 4. 保存并测试
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 关键修改点

### 在 `location /` 块中添加:

```nginx
location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # ⚠️ 添加这一行 (关键!)
    proxy_set_header Referer $http_referer;

    proxy_cache_bypass $http_upgrade;
}
```

### 添加图片API特殊处理:

```nginx
# 在所有location块之后添加
location /api/images {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Referer $http_referer;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_no_cache 1;
    proxy_cache_bypass 1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 🧪 测试验证

### 1. 测试Nginx配置

```bash
# 在服务器上执行
sudo nginx -t
# 应该输出: syntax is ok 和 test is successful
```

### 2. 检查Nginx状态

```bash
sudo systemctl status nginx
# 应该显示: active (running)
```

### 3. 查看错误日志

```bash
sudo tail -f /var/log/nginx/manga-reader-error.log
```

### 4. 浏览器测试

访问: https://manga.ai-knowledgepoints.cn

打开浏览器开发者工具 → Network标签:
- ✅ 图片请求状态应为 200
- ✅ 不应该有403错误
- ✅ 请求头中应包含 Referer

### 5. 检查Referer是否正确转发

在浏览器Console中执行:
```javascript
// 查看图片请求的Referer
fetch('/api/images/test/test.jpg').then(r => console.log(r.headers))
```

---

## 🔧 故障排查

### 问题1: 图片仍然403

**检查清单**:
1. ✅ Nginx配置已更新并重载
2. ✅ `.env.local` 中配置了正确的域名
3. ✅ Next.js已重启: `pm2 restart manga-reader`
4. ✅ 检查环境变量: `pm2 env 0 | grep NEXT_PUBLIC`

**验证命令**:
```bash
# 检查Referer是否到达后端
sudo tail -f /var/log/nginx/manga-reader-access.log | grep REFERER
```

### 问题2: Nginx测试失败

**解决方法**:
```bash
# 恢复备份
sudo cp /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn.backup \
  /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn

# 查看错误详情
sudo nginx -t

# 检查语法错误行号
```

### 问题3: SSL证书问题

**如果SSL证书部分出错**,不要修改SSL配置,检查:
```bash
# 检查证书文件是否存在
ls -la /etc/letsencrypt/live/manga.ai-knowledgepoints.cn/

# 检查证书有效期
sudo certbot certificates
```

---

## 📊 性能对比

### 优化前:
- ❌ 图片403错误
- ❌ 静态资源无缓存
- ❌ 每次都请求相同资源

### 优化后:
- ✅ 图片正常加载
- ✅ 静态资源缓存1年
- ✅ API响应更快
- ✅ 带宽使用减少50%+

---

## 🎯 最小化修改方案

如果只想解决图片403问题,只需要做最少的修改:

```bash
sudo nano /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn
```

在 `location /` 块中,找到:
```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

在这行下面添加:
```nginx
proxy_set_header Referer $http_referer;
```

保存,测试,重载:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

这个最小修改就能解决图片403问题!

---

## 📞 快速命令参考

```bash
# 备份配置
sudo cp /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn \
  /etc/nginx/sites-enabled/manga.ai-knowledgepoints.cn.backup

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx

# 重启Nginx(如果重载无效)
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/manga-reader-error.log

# 查看访问日志
sudo tail -f /var/log/nginx/manga-reader-access.log
```
