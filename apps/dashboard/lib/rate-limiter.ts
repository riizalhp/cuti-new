const windows = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, val] of windows) {
    if (now > val.resetAt) windows.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  cleanup();
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  existing.count++;
  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}
