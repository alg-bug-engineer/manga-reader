#!/bin/bash

# Gemini API 代理服务器启动脚本

echo "🚀 启动 Gemini API 代理服务器"
echo "================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python 3"
    echo "请先安装 Python 3: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo ""
    echo "📦 创建 Python 虚拟环境..."
    uv venv
fi

# 激活虚拟环境
echo "✅ 激活虚拟环境"
source .venv/bin/activate

# 检查并安装依赖
echo ""
echo "📦 检查 Python 依赖..."

if ! python3 -c "import flask" 2>/dev/null; then
    echo "安装依赖中..."
    uv pip install -q -r requirements.txt

    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装成功"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已安装，跳过"
fi

# 检查环境变量
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  未找到 .env.local 文件"
    echo "请先运行: ./setup-gemini.sh"
    exit 1
fi

echo "✅ 环境变量已加载"

# 启动服务器
echo ""
echo "================================"
echo "🎯 启动 Python 代理服务器"
echo "================================"
echo ""

python3 gemini_proxy_server.py
