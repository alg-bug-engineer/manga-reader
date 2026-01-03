const path = require('path');

module.exports = {
  apps: [
    {
      name: 'manga-reader',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      // 使用相对路径，自动适应当前目录
      cwd: path.resolve(__dirname),
      instances: 1,
      exec_mode: 'fork', // 暂时使用 fork 模式，更稳定
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // 使用相对路径存储日志
      error_file: path.join(__dirname, 'logs', 'err.log'),
      out_file: path.join(__dirname, 'logs', 'out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // 日志轮转配置
      log_file_size: 10485760, // 10MB
      log_file_count: 5,
      // 进程管理
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Graceful shutdown
      kill_timeout: 5000,
      // 健康检查 - 移除 wait_ready，因为 next start 没有监听端口
      listen_timeout: 10000,
    },
  ],
};
