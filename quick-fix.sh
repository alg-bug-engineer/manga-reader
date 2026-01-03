#!/bin/bash

# ========================================
# 快速修复脚本 - 服务器端使用
# 在 /root/manga-reader 目录下运行
# ========================================

set -e

echo "=========================================="
echo "🔧 Manga Reader 快速修复"
echo "=========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /root/manga-reader

# 1. 停止失败的进程
echo -e "\n${YELLOW}🛑 步骤 1: 停止失败进程...${NC}"
pm2 delete manga-reader 2>/dev/null || echo "没有进程需要停止"
echo -e "${GREEN}✅ 进程已停止${NC}"

# 2. 清理旧的构建文件
echo -e "\n${YELLOW}🧹 步骤 2: 清理旧构建...${NC}"
rm -rf .next node_modules/.cache
echo -e "${GREEN}✅ 清理完成${NC}"

# 3. 安装新的类型定义包
echo -e "\n${YELLOW}📦 步骤 3: 安装类型定义包...${NC}"
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
echo -e "${GREEN}✅ 类型定义包已安装${NC}"

# 4. 重新构建
echo -e "\n${YELLOW}🔨 步骤 4: 重新构建项目...${NC}"
if ! NODE_ENV=production npm run build 2>&1 | tee build.log; then
    echo -e "${RED}❌ 构建失败！查看 build.log${NC}"
    cat build.log
    exit 1
fi

# 验证构建产物
if [ ! -f .next/BUILD_ID ]; then
    echo -e "${RED}❌ 构建产物不完整！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功${NC}"

# 5. 创建日志目录
echo -e "\n${YELLOW}📁 步骤 5: 创建日志目录...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ 日志目录已创建${NC}"

# 6. 启动应用
echo -e "\n${YELLOW}🚀 步骤 6: 启动应用...${NC}"
pm2 start ecosystem.config.js --env production

# 等待启动
sleep 3

# 检查状态
if pm2 describe manga-reader | grep -q "online"; then
    echo -e "${GREEN}✅ 应用启动成功${NC}"
else
    echo -e "${RED}❌ 应用启动失败${NC}"
    pm2 logs manga-reader --err --lines 30
    exit 1
fi

# 7. 保存配置
echo -e "\n${YELLOW}💾 步骤 7: 保存 PM2 配置...${NC}"
pm2 save
echo -e "${GREEN}✅ 配置已保存${NC}"

# 8. 显示状态
echo -e "\n${YELLOW}📊 应用状态：${NC}"
pm2 status

echo -e "\n${GREEN}=========================================="
echo "✅ 修复完成！"
echo "==========================================${NC}"
echo -e "\n测试访问："
curl -s http://localhost:4000 | head -20
echo -e "\n\n查看日志: ${YELLOW}pm2 logs manga-reader${NC}"
