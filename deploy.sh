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

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

# 3. 清理旧的构建文件
echo -e "\n${YELLOW}🧹 步骤 3: 清理旧构建...${NC}"
rm -rf .next
echo -e "${GREEN}✅ 旧构建已清理${NC}"

# 4. 安装依赖
echo -e "\n${YELLOW}📦 步骤 4: 安装依赖...${NC}"
npm ci
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 5. 构建项目（关键步骤，必须成功）
echo -e "\n${YELLOW}🔨 步骤 5: 构建生产版本...${NC}"
if ! NODE_ENV=production npm run build; then
    echo -e "${RED}❌ 构建失败！请检查错误信息${NC}"
    exit 1
fi

# 验证构建产物是否存在
if [ ! -d .next ]; then
    echo -e "${RED}❌ 错误: 构建产物 .next 目录不存在${NC}"
    exit 1
fi

if [ ! -f .next/BUILD_ID ]; then
    echo -e "${RED}❌ 错误: BUILD_ID 文件不存在，构建可能未完成${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功完成${NC}"

# 6. 创建日志目录
echo -e "\n${YELLOW}📁 步骤 6: 创建日志目录...${NC}"
mkdir -p logs
echo -e "${GREEN}✅ 日志目录已创建${NC}"

# 7. 启动应用
echo -e "\n${YELLOW}🚀 步骤 7: 启动应用...${NC}"
pm2 start ecosystem.config.js --env production

# 等待应用启动
sleep 3

# 检查应用状态
if ! pm2 describe manga-reader | grep -q "online"; then
    echo -e "${RED}❌ 应用启动失败，查看日志：${NC}"
    pm2 logs manga-reader --err --lines 20 --nostream
    exit 1
fi

echo -e "${GREEN}✅ 应用已成功启动${NC}"

# 8. 保存 PM2 配置
echo -e "\n${YELLOW}💾 步骤 8: 保存 PM2 配置...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 配置已保存${NC}"

# 9. 设置开机自启（如果还未设置）
echo -e "\n${YELLOW}⚙️  步骤 9: 检查开机自启...${NC}"
if ! pm2 startup | grep -q "already"; then
    echo -e "${YELLOW}提示: 请运行以下命令设置开机自启:${NC}"
    pm2 startup
else
    echo -e "${GREEN}✅ 开机自启已配置${NC}"
fi

# 10. 显示状态
echo -e "\n${YELLOW}📊 步骤 10: 应用状态...${NC}"
pm2 status

echo -e "\n${GREEN}=========================================="
echo "✅ 部署完成！"
echo "==========================================${NC}"
echo -e "\n📍 应用访问地址: ${YELLOW}http://localhost:4000${NC}"
echo -e "\n常用命令:"
echo -e "  查看日志: ${YELLOW}pm2 logs manga-reader${NC}"
echo -e "  查看状态: ${YELLOW}pm2 status${NC}"
echo -e "  重启应用: ${YELLOW}pm2 restart manga-reader${NC}"
echo -e "  停止应用: ${YELLOW}pm2 stop manga-reader${NC}"
echo -e "  监控面板: ${YELLOW}pm2 monit${NC}"
echo ""
