// PM2 config for production.
// Usage:
//   pm2 start ecosystem.config.js --env production
//   pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: "deamaclub",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/deamaclub",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      out_file: "/var/log/pm2/deamaclub.out.log",
      error_file: "/var/log/pm2/deamaclub.err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
