module.exports = {
  apps: [
    {
      name: 'llm-service',
      script: 'npm',
      args: 'run start',
      cwd: './apps/llm-service',
      source_map_support: true,
      watch: true,
      env_file: './apps/llm-service/.env',
      max_memory_restart: '512M',
      error_file: './logs/llm-service-error.log',
      out_file: './logs/llm-service-out.log',
      max_restarts: 10,
      min_uptime: '5s',
      exec_mode: 'cluster',
      instances: 1,
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'orchestration-service',
      script: 'npm',
      args: 'run start',
      cwd: './apps/orchestration-service',
      source_map_support: true,
      watch: true,
      env_file: './apps/orchestration-service/.env',
      max_memory_restart: '512M',
      error_file: './logs/orchestration-service-error.log',
      out_file: './logs/orchestration-service-out.log',
      max_restarts: 10,
      min_uptime: '5s',
      exec_mode: 'cluster',
      instances: 1,
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'stable-ts',
      script: "app.py",
      interpreter: '/root/projects/fragmentAudio/apps/stable-ts/venv/bin/python',
      cwd: './apps/stable-ts',
      watch: true,
      env_file: './apps/stable-ts/.env',
      error_file: './logs/stable-ts-error.log',
      out_file: './logs/stable-ts-out.log',
      exec_mode: 'fork',
      instances: 1,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 3000,
      autorestart: true
    },
    {
      name: 'video-db',
      script: 'npm',
      args: 'run start',
      cwd: './apps/video-db',
      source_map_support: true,
      watch: true,
      env_file: './apps/video-db/.env',
      max_memory_restart: '512M',
      error_file: './logs/video-db-error.log',
      out_file: './logs/video-db-out.log',
      max_restarts: 10,
      min_uptime: '5s',
      exec_mode: 'cluster',
      instances: 1,
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  deploy: {
    production: {
      user: 'user',
      host: 'production-host',
      ref: 'origin/main',
      repo: 'git-repository-url',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    development: {
      user: 'user',
      host: 'development-host',
      ref: 'origin/develop',
      repo: 'git-repository-url',
      path: '/var/www/development',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'development'
      }
    }
  }
};
