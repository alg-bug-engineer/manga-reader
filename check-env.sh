#!/bin/bash

# ========================================
# 环境配置检查脚本
# ========================================

echo "========================================"
echo "Manga Reader 环境配置检查"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_env_file() {
    if [ -f .env.local ]; then
        echo -e "${GREEN}✓${NC} .env.local 文件存在"
        return 0
    else
        echo -e "${RED}✗${NC} .env.local 文件不存在"
        echo -e "${YELLOW}请复制 .env.production 或 .env.example 为 .env.local${NC}"
        return 1
    fi
}

check_base_url() {
    BASE_URL=$(grep "NEXT_PUBLIC_BASE_URL" .env.local | cut -d '=' -f2)
    SITE_URL=$(grep "NEXT_PUBLIC_SITE_URL" .env.local | cut -d '=' -f2)

    echo ""
    echo "检查生产环境URL配置:"
    echo "  NEXT_PUBLIC_BASE_URL = $BASE_URL"
    echo "  NEXT_PUBLIC_SITE_URL = $SITE_URL"

    if [[ $BASE_URL == *"localhost"* ]] || [[ $SITE_URL == *"localhost"* ]]; then
        echo -e "${RED}✗${NC} URL配置仍为localhost，请修改为生产域名"
        return 1
    else
        echo -e "${GREEN}✓${NC} URL已配置为生产域名"
        return 0
    fi
}

check_jwt_secret() {
    JWT_SECRET=$(grep "JWT_SECRET" .env.local | cut -d '=' -f2)

    echo ""
    echo "检查JWT密钥配置:"

    if [[ $JWT_SECRET == *"your-secret-key"* ]] || [[ -z $JWT_SECRET ]]; then
        echo -e "${RED}✗${NC} JWT_SECRET未设置或使用默认值"
        echo -e "${YELLOW}请生成强随机密钥: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"${NC}"
        return 1
    else
        SECRET_LENGTH=${#JWT_SECRET}
        if [ $SECRET_LENGTH -lt 32 ]; then
            echo -e "${YELLOW}⚠${NC} JWT_SECRET长度较短($SECRET_LENGTH字符)，建议至少64字符"
            return 1
        else
            echo -e "${GREEN}✓${NC} JWT_SECRET已配置($SECRET_LENGTH字符)"
            return 0
        fi
    fi
}

check_data_directory() {
    echo ""
    echo "检查数据目录:"

    if [ -d "data" ]; then
        echo -e "${GREEN}✓${NC} data目录存在"

        # 检查是否有漫画数据
        MANGA_COUNT=$(find data -mindepth 1 -maxdepth 1 -type d | wc -l)
        echo "  发现 $MANGA_COUNT 个漫画目录"

        if [ $MANGA_COUNT -eq 0 ]; then
            echo -e "${YELLOW}⚠${NC} data目录为空，请添加漫画数据"
            return 1
        fi

        return 0
    else
        echo -e "${RED}✗${NC} data目录不存在"
        return 1
    fi
}

check_node_modules() {
    echo ""
    echo "检查依赖:"

    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓${NC} node_modules目录存在"
        return 0
    else
        echo -e "${RED}✗${NC} node_modules目录不存在"
        echo -e "${YELLOW}请运行: npm install${NC}"
        return 1
    fi
}

check_build() {
    echo ""
    echo "检查构建文件:"

    if [ -d ".next" ]; then
        echo -e "${GREEN}✓${NC} .next目录存在"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} .next目录不存在"
        echo "请运行: npm run build"
        return 1
    fi
}

# ========================================
# 主检查流程
# ========================================

ISSUES_FOUND=0

# 检查基础文件
if ! check_env_file; then
    ISSUES_FOUND=1
fi

if [ -f .env.local ]; then
    if ! check_base_url; then
        ISSUES_FOUND=1
    fi

    if ! check_jwt_secret; then
        ISSUES_FOUND=1
    fi
fi

# 检查目录和依赖
if ! check_data_directory; then
    ISSUES_FOUND=1
fi

if ! check_node_modules; then
    ISSUES_FOUND=1
fi

check_build

# ========================================
# 总结
# ========================================

echo ""
echo "========================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}所有检查通过! ✓${NC}"
    echo ""
    echo "下一步操作:"
    echo "1. 启动应用: npm run dev (开发) 或 pm2 start ecosystem.config.js (生产)"
    echo "2. 访问应用: $BASE_URL"
else
    echo -e "${RED}发现配置问题，请修复后重试${NC}"
    echo ""
    echo "常见问题:"
    echo "1. 环境变量未正确配置"
    echo "2. 生产域名未设置"
    echo "3. JWT_SECRET未生成"
    echo "4. 数据目录缺失"
fi
echo "========================================"
