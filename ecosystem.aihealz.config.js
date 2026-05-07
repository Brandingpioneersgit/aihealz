// Requires pm2 (npm install -g pm2) on the host. Not a dev dependency.
module.exports = {
  apps: [{
    name: 'aihealz',
    script: 'node_modules/.bin/next',
    args: 'start -p 5002',
    cwd: '/home/aihealz.com/public_html',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5002
    },
    max_memory_restart: '1G',
    kill_timeout: 8000,
    restart_delay: 4000,
    out_file: '/home/aihealz.com/public_html/logs/out.log',
    error_file: '/home/aihealz.com/public_html/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
