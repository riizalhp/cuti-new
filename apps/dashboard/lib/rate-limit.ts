/**
 * In-Memory Sliding-Window Rate Limiter
 * Provides rate limiting protection for sensitive endpoints (Auth, AI, Uploads)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime <= now) {
    const resetTime = now + options.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: options.limit - 1, resetTime };
  }

  if (entry.count >= options.limit) {
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: options.limit - entry.count,
    resetTime: entry.resetTime,
  };
}
