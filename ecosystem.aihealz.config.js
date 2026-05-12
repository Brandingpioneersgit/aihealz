// Requires pm2 (npm install -g pm2) on the host. Not a dev dependency.
//
// Cluster mode: spawn one Node worker per CPU core so a slow request on one
// worker doesn't block every visitor and an OOM restart only drops the
// in-flight requests of that single worker.
module.exports = {
  apps: [{
    name: 'aihealz',
    script: 'node_modules/.bin/next',
    args: 'start -p 5002',
    cwd: '/opt/aihealz',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5002
    },
    max_memory_restart: '1500M',
    kill_timeout: 8000,
    restart_delay: 4000,
    out_file: '/opt/aihealz/logs/out.log',
    error_file: '/opt/aihealz/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // pm2 cluster mode handles SIGINT/SIGTERM with this many ms before SIGKILL
    listen_timeout: 10000,
  }]
};
