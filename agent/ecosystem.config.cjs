const path = require('path');
const fs = require('fs');

// Load .env from agent directory
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

module.exports = {
  apps: [
    {
      name: "grace-agent",
      script: "npx",
      args: "tsx src/grace-gateway.ts",
      cwd: "/Users/sethstudio1/Projects/grace-network/agent",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 4200,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        GRACE_API_KEY: process.env.GRACE_API_KEY || "grace-net-2026",
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      },
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
