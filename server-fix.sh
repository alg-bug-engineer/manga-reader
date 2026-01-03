#!/bin/bash

# ========================================
# 服务器端修复脚本
# 在 /root/manga-reader 目录运行
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "🔧 服务器端修复 - manga-reader"
echo "=========================================="

# 进入项目目录
cd /root/manga-reader

echo -e "\n${YELLOW}当前目录: ${NC}$(pwd)"
echo -e "${YELLOW}检查 .next 目录:${NC}"
ls -la .next/ 2>/dev/null || echo "  .next 目录不存在（这很奇怪，因为刚才构建成功了）"

# 检查 BUILD_ID
echo -e "\n${YELLOW}检查 BUILD_ID:${NC}"
if [ -f .next/BUILD_ID ]; then
    echo -e "  ${GREEN}✓ BUILD_ID 存在${NC}"
    cat .next/BUILD_ID
else
    echo -e "  ${RED}✗ BUILD_ID 不存在！${NC}"
    exit 1
fi

# 1. 完全停止 PM2
echo -e "\n${YELLOW}🛑 步骤 1: 完全停止 PM2 进程...${NC}"
pm2 delete manga-reader 2>/dev/null || echo "  没有旧进程"
pm2 flush
echo -e "${GREEN}✅ PM2 已停止${NC}"

# 2. 验证构建产物
echo -e "\n${YELLOW}🔍 步骤 2: 验证构建产物...${NC}"
if [ ! -d .next ]; then
    echo -e "${RED}❌ .next 目录不存在！${NC}"
    exit 1
fi

if [ ! -f .next/BUILD_ID ]; then
    echo -e "${RED}❌ BUILD_ID 不存在！${NC}"
    exit 1
fi

if [ ! -d .next/server ]; then
    echo -e "${RED}❌ .next/server 目录不存在！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建产物完整${NC}"

# 3. 清空日志
echo -e "\n${YELLOW}🧹 步骤 3: 清空旧日志...${NC}"
mkdir -p logs
rm -f logs/*.log
echo -e "${GREEN}✅ 日志已清空${NC}"

# 4. 验证 ecosystem.config.js
echo -e "\n${YELLOW}📋 步骤 4: 验证配置文件...${NC}"
if [ ! -f ecosystem.config.js ]; then
    echo -e "${RED}❌ ecosystem.config.js 不存在！${NC}"
    exit 1
fi

# 检查配置文件中是否还有硬编码路径
if grep -q "/Users/zql_minii" ecosystem.config.js; then
    echo -e "${RED}❌ 配置文件中还有硬编码的本地路径！${NC}"
    echo "请手动修复 ecosystem.config.js"
    exit 1
fi

echo -e "${GREEN}✅ 配置文件正确${NC}"

# 5. 使用 PM2 启动（添加 --no-daemon 模式查看实时日志）
echo -e "\n${YELLOW}🚀 步骤 5: 启动应用...${NC}"
pm2 start ecosystem.config.js --env production

# 等待应用启动
echo "  等待应用启动（5秒）..."
sleep 5

# 6. 检查状态
echo -e "\n${YELLOW}📊 步骤 6: 检查应用状态...${NC}"
pm2 status

# 检查是否在线
if pm2 describe manga-reader | grep -q "online"; then
    echo -e "${GREEN}✅ 应用状态: online${NC}"
else
    echo -e "${RED}❌ 应用启动失败${NC}"
    echo -e "\n${YELLOW}查看错误日志:${NC}"
    pm2 logs manga-reader --err --lines 30 --nostream
    exit 1
fi

# 7. 测试访问
echo -e "\n${YELLOW}🌐 步骤 7: 测试访问...${NC}"
if curl -s http://localhost:4000 > /dev/null; then
    echo -e "${GREEN}✅ 应用可以访问${NC}"
else
    echo -e "${RED}❌ 应用无法访问${NC}"
fi

# 8. 保存配置
echo -e "\n${YELLOW}💾 步骤 8: 保存 PM2 配置...${NC}"
pm2 save
echo -e "${GREEN}✅ 配置已保存${NC}"

# 9. 显示日志路径
echo -e "\n${YELLOW}📁 日志文件位置:${NC}"
echo "  错误日志: /root/manga-reader/logs/err.log"
echo "  输出日志: /root/manga-reader/logs/out.log"

echo -e "\n${GREEN}=========================================="
echo "✅ 修复完成！"
echo "==========================================${NC}"
echo -e "\n常用命令:"
echo -e "  查看状态: ${YELLOW}pm2 status${NC}"
echo -e "  查看日志: ${YELLOW}pm2 logs manga-reader${NC}"
echo -e "  重启应用: ${YELLOW}pm2 restart manga-reader${NC}"
echo -e "  停止应用: ${YELLOW}pm2 stop manga-reader${NC}"
echo ""
