const appRoot = process.env.ACHAKI_DIR || '/var/www/achaki'

module.exports = {
  apps: [
    {
      name: 'achaki-api',
      cwd: `${appRoot}/backend`,
      script: 'dist/main.js',
      node_args: '--env-file=.env.production',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
