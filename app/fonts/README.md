# Fonts

本目录包含本地字体文件，用于替代 Google Fonts 以避免在阿里云 ECS 上无法访问的问题。

## 字体来源

所有字体文件均从 Google Fonts 官方 CDN 下载：
- Manrope: https://fonts.google.com/specimen/Manrope
- Outfit: https://fonts.google.com/specimen/Outfit
- JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono
- Noto Sans SC: https://fonts.google.com/specimen/Noto+Sans+SC

## 更新字体

如需更新字体，可以运行：
```bash
cd app
./download-fonts.sh
```

## 说明

使用 `next/font/local` 替代 `next/font/google`，可以：
1. 避免服务器访问 Google Fonts 的问题
2. 减少首次加载时的网络请求
3. 提高页面加载速度
