/**
 * dev.js — Smart dev runner
 * 1. يمسح frontend/.next cache عشان يأخذ الـ env الجديد دايماً
 * 2. يقتل أي process شاغل بورت 3001
 * 3. يشغّل Docker + Backend + Frontend مع بعض
 */
const { execSync } = require('child_process');
const { concurrently } = require('concurrently');
const fs = require('fs');
const path = require('path');

// ── امسح الـ Next.js cache ────────────────────────────────────────────────
const nextCacheDir = path.join(__dirname, '..', 'frontend', '.next');
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
  console.log('[DEV] Cleared frontend/.next cache');
}

// ── اقتل أي process على 3001 ──────────────────────────────────────────────
function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(
        `netstat -ano | findstr :${port}`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const pids = new Set();
      result.trim().split('\n').forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && /^\d+$/.test(pid)) pids.add(pid);
      });
      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[DEV] Killed process ${pid} on port ${port}`);
        } catch {}
      });
    }
  } catch {} // مفيش process — طبيعي
}

console.log('[DEV] Checking port 3001...');
killPort(3001);
console.log('[DEV] Starting all services...\n');

concurrently(
  [
    {
      command: 'docker compose up',
      name: 'DOCKER',
      prefixColor: 'blue',
    },
    {
      command: 'cd backend && npm run dev',
      name: 'BACKEND',
      prefixColor: 'green',
    },
    {
      command: 'cd frontend && npm run dev',
      name: 'FRONTEND',
      prefixColor: 'cyan',
    },
  ],
  {
    killOthers: ['failure'],
    restartTries: 0,
    prefix: '[{name}]',
    timestampFormat: 'HH:mm:ss',
  }
).result.catch(() => {
  console.log('\n[DEV] Stopped.');
  process.exit(0);
});
