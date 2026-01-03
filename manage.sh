#!/bin/bash

# Manga Reader PM2 管理脚本

case "$1" in
  start)
    echo "🚀 启动应用..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    ;;
  stop)
    echo "🛑 停止应用..."
    pm2 stop manga-reader
    ;;
  restart)
    echo "🔄 重启应用..."
    pm2 restart manga-reader
    ;;
  reload)
    echo "🔄 平滑重启应用..."
    pm2 reload manga-reader
    ;;
  logs)
    echo "📋 查看日志 (Ctrl+C 退出)..."
    pm2 logs manga-reader
    ;;
  status)
    echo "📊 应用状态:"
    pm2 status
    ;;
  monit)
    echo "📈 实时监控..."
    pm2 monit
    ;;
  deploy)
    echo "🚀 开始部署..."
    ./deploy.sh
    ;;
  update)
    echo "🔄 更新并重启..."
    git pull
    npm run build
    pm2 restart manga-reader
    ;;
  clean)
    echo "🧹 清理日志..."
    pm2 flush
    rm -rf logs/*
    echo "✅ 日志已清理"
    ;;
  *)
    echo "Manga Reader PM2 管理脚本"
    echo ""
    echo "用法: ./manage.sh [命令]"
    echo ""
    echo "命令:"
    echo "  start    - 启动应用"
    echo "  stop     - 停止应用"
    echo "  restart  - 重启应用"
    echo "  reload   - 平滑重启（零停机）"
    echo "  logs     - 查看日志"
    echo "  status   - 查看状态"
    echo "  monit    - 实时监控"
    echo "  deploy   - 完整部署"
    echo "  update   - 更新代码并重启"
    echo "  clean    - 清理日志"
    echo ""
    echo "示例:"
    echo "  ./manage.sh logs     # 查看日志"
    echo "  ./manage.sh restart  # 重启应用"
    echo "  ./manage.sh deploy   # 重新部署"
    ;;
esac
