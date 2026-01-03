#!/bin/bash

# ========================================
# Manga Reader 生产环境部署脚本
# ========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🚀 Manga Reader 生产环境部署"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查环境变量
echo -e "\n${YELLOW}📋 步骤 1: 检查环境配置...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ 错误: .env.production 文件不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 环境配置文件存在${NC}"

# 2. 停止旧进程
echo -e "\n${YELLOW}🛑 步骤 2: 停止旧进程...${NC}"
pm2 delete manga-reader 2>/dev/null || echo "没有运行中的进程"
echo -e "${GREEN}✅ 旧进程已停止${NC}"

# 3. 安装依赖
echo -e "\n${YELLOW}📦 步骤 3: 安装依赖...${NC}"
npm ci --production=false
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 4. 构建项目
echo -e "\n${YELLOW}🔨 步骤 4: 构建生产版本...${NC}"
NODE_ENV=production npm run build
echo -e "${GREEN}✅ 构建完成${NC}"

# 5. 创建日志目录
echo -e "\n${YELLOW}📁 步骤 5: 创建日志目录...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ 日志目录已创建${NC}"

# 6. 启动应用
echo -e "\n${YELLOW}🚀 步骤 6: 启动应用...${NC}"
pm2 start ecosystem.config.js --env production
echo -e "${GREEN}✅ 应用已启动${NC}"

# 7. 保存 PM2 配置
echo -e "\n${YELLOW}💾 步骤 7: 保存 PM2 配置...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 配置已保存${NC}"

# 8. 设置开机自启（如果还未设置）
echo -e "\n${YELLOW}⚙️  步骤 8: 检查开机自启...${NC}"
if ! pm2 startup | grep -q "already"; then
    echo -e "${YELLOW}提示: 请运行以下命令设置开机自启:${NC}"
    pm2 startup
else
    echo -e "${GREEN}✅ 开机自启已配置${NC}"
fi

# 9. 显示状态
echo -e "\n${YELLOW}📊 步骤 9: 应用状态...${NC}"
pm2 status

echo -e "\n${GREEN}=========================================="
echo "✅ 部署完成！"
echo "==========================================${NC}"
echo -e "\n常用命令:"
echo -e "  查看日志: ${YELLOW}pm2 logs manga-reader${NC}"
echo -e "  查看状态: ${YELLOW}pm2 status${NC}"
echo -e "  重启应用: ${YELLOW}pm2 restart manga-reader${NC}"
echo -e "  停止应用: ${YELLOW}pm2 stop manga-reader${NC}"
echo -e "  监控面板: ${YELLOW}pm2 monit${NC}"
echo ""
