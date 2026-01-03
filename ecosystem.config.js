module.exports = {
  apps: [
    {
      name: 'manga-reader',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      cwd: '/Users/zql_minii/ai-project/manga-reader',
      instances: 1,
      exec_mode: 'cluster',
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
      error_file: './logs/err.log',
      out_file: './logs/out.log',
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
      wait_ready: true,
      // 健康检查
      listen_timeout: 10000,
      // 自动重启策略
      exp_backoff_restart_delay: 100,
    },
  ],
};
