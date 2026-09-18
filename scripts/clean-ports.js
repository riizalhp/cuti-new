/**
 * scripts/clean-ports.js
 * Otomatis membersihkan proses zombie yang tertinggal di port dev
 * dan menghapus file lock dev Next.js yang stale sebelum dev server berjalan.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 4321];
const CURRENT_PID = process.pid;

function getListeningPidsOnPort(port) {
  const pids = new Set();
  try {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = output.split('\n');
    for (const line of lines) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const localAddress = parts[1];
        const pidStr = parts[parts.length - 1];
        const pid = parseInt(pidStr, 10);
        if (localAddress.endsWith(`:${port}`) && !isNaN(pid) && pid > 4 && pid !== CURRENT_PID) {
          pids.add(pid);
        }
      }
    }
  } catch {
    // Abaikan jika netstat gagal
  }
  return Array.from(pids);
}

function killPid(pid) {
  try {
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function cleanStaleDevLocks() {
  const nextApps = ['apps/dashboard', 'apps/admin', 'apps/learning', 'apps/faq'];
  const rootDir = path.resolve(__dirname, '..');

  for (const app of nextApps) {
    const lockPath = path.join(rootDir, app, '.next', 'dev', 'lock');
    try {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        console.log(`[clean-ports] Removed stale lock: ${app}/.next/dev/lock`);
      }
    } catch {
      // Abaikan jika file sedang digunakan atau tidak ada
    }

    // Bersihkan cache dev yang korup jika proses mati tidak wajar
    const devCache = path.join(rootDir, app, '.next', 'dev', 'cache');
    try {
      if (fs.existsSync(devCache)) {
        fs.rmSync(devCache, { recursive: true, force: true });
        console.log(`[clean-ports] Cleared stale dev cache: ${app}/.next/dev/cache`);
      }
    } catch {
      // Abaikan jika sedang di-lock oleh proses lain
    }
  }
}

function main() {
  let cleanedCount = 0;

  for (const port of TARGET_PORTS) {
    const pids = getListeningPidsOnPort(port);
    for (const pid of pids) {
      const killed = killPid(pid);
      if (killed) {
        console.log(`[clean-ports] Killed zombie process (PID: ${pid}) on port ${port}`);
        cleanedCount++;
      }
    }
  }

  cleanStaleDevLocks();

  if (cleanedCount > 0) {
    console.log(`[clean-ports] Berhasil membersihkan ${cleanedCount} proses zombie lama.`);
  }
}

main();
