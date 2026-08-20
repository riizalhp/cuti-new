/**
 * Employr Logger Service
 *
 * Centralized logging with async batched writes to PostgreSQL.
 * Provides three logging layers:
 *   1. auditLogs   — Track who changed what (data integrity)
 *   2. securityEvents — Track security anomalies (brute force, unauthorized access)
 *   3. appLogs     — Application-level logs (errors, API calls, system events)
 */

import { PrismaClient, LogSeverity, SecurityEventType, AppLogSource } from "@prisma/client";

// Singleton prisma — import from index.ts in production, or create one here for isolation
let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!_prisma) {
    // Lazy init — avoids circular dependency with index.ts
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return _prisma;
}

// ─── BATCH WRITE BUFFER ───────────────────────────────────────────────

type PendingLog =
  | { type: "audit"; data: any }
  | { type: "security"; data: any }
  | { type: "app"; data: any };

const BUFFER: PendingLog[] = [];
let FLUSHING = false;
const FLUSH_INTERVAL_MS = 3_000; // Flush every 3 seconds
const MAX_BUFFER_SIZE = 100; // Or flush when buffer hits 100

function scheduleFlush() {
  if (FLUSHING) return;
  FLUSHING = true;
  setTimeout(() => flushBuffer(), FLUSH_INTERVAL_MS);
}

async function flushBuffer() {
  if (BUFFER.length === 0) {
    FLUSHING = false;
    return;
  }

  const batch = BUFFER.splice(0, MAX_BUFFER_SIZE);
  const prisma = getPrisma();

  try {
    const audits = batch.filter((b) => b.type === "audit").map((b) => b.data);
    const securities = batch.filter((b) => b.type === "security").map((b) => b.data);
    const apps = batch.filter((b) => b.type === "app").map((b) => b.data);

    await prisma.$transaction([
      ...(audits.length > 0 ? [prisma.audit_logs.createMany({ data: audits })] : []),
      ...(securities.length > 0 ? [prisma.security_events.createMany({ data: securities })] : []),
      ...(apps.length > 0 ? [prisma.app_logs.createMany({ data: apps })] : []),
    ]);
  } catch (err) {
    console.error("[Logger] Flush failed:", err);
  }

  FLUSHING = false;
  // If there are remaining items, schedule another flush
  if (BUFFER.length > 0) {
    scheduleFlush();
  }
}

// Flush on process exit
if (typeof process !== "undefined") {
  process.on("beforeExit", () => {
    if (BUFFER.length > 0) {
      // Synchronous best-effort flush
      const prisma = getPrisma();
      prisma.$transaction(
        BUFFER.map((b) => {
          if (b.type === "audit") return prisma.audit_logs.create({ data: b.data });
          if (b.type === "security") return prisma.security_events.create({ data: b.data });
          return prisma.app_logs.create({ data: b.data });
        })
      ).catch(() => {});
    }
  });
}

// ─── HELPER: Extract request context ──────────────────────────────────

export interface RequestContext {
  ip?: string | null;
  userAgent?: string | null;
  userId?: string | null;
}

export function extractRequestContext(req?: any): RequestContext {
  if (!req) return {};
  const headers = req.headers;
  if (!headers) return {};

  // Handle both NextRequest and standard Request
  const ip =
    headers.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get?.("x-real-ip") ||
    null;
  const userAgent = headers.get?.("user-agent") || null;

  return { ip, userAgent };
}

// ─── 1. AUDIT LOGS ────────────────────────────────────────────────────

export interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ip?: string | null;
  userAgent?: string | null;
  severity?: LogSeverity;
}

/**
 * Log an audit event (data change tracking).
 * Writes are batched asynchronously for performance.
 */
export function logAudit(input: AuditLogInput): void {
  BUFFER.push({
    type: "audit",
    data: {
      id: crypto.randomUUID(),
      user_id: input.userId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId || null,
      old_value: input.oldValue || null,
      new_value: input.newValue || null,
      ip_address: input.ip || null,
      user_agent: input.userAgent || null,
      severity: input.severity || "INFO",
      created_at: new Date(),
    },
  });
  scheduleFlush();
}

// Convenience: log with request context auto-extracted
export function logAuditFromReq(
  req: any,
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  opts?: { oldValue?: any; newValue?: any; severity?: LogSeverity }
): void {
  const ctx = extractRequestContext(req);
  logAudit({
    userId,
    action,
    entity,
    entityId,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    ...opts,
  });
}

// ─── 2. SECURITY EVENTS ───────────────────────────────────────────────

export interface SecurityEventInput {
  userId?: string | null;
  eventType: SecurityEventType;
  ip?: string | null;
  userAgent?: string | null;
  email?: string | null;
  details?: any;
  severity?: LogSeverity;
}

/**
 * Log a security event.
 * Used for brute force detection, unauthorized access, suspicious activity.
 */
export function logSecurityEvent(input: SecurityEventInput): void {
  BUFFER.push({
    type: "security",
    data: {
      id: crypto.randomUUID(),
      user_id: input.userId || null,
      event_type: input.eventType,
      ip_address: input.ip || null,
      user_agent: input.userAgent || null,
      email: input.email || null,
      details: input.details || null,
      severity: input.severity || "WARNING",
      created_at: new Date(),
    },
  });
  scheduleFlush();
}

/**
 * Brute force detector: count failed logins per IP in the last N minutes.
 * Returns true if threshold is exceeded.
 */
export async function detectBruteForce(
  ip: string,
  email: string,
  windowMinutes = 15,
  maxAttempts = 5
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowMinutes * 60_000);
    const count = await getPrisma().security_events.count({
      where: {
        event_type: "LOGIN_FAILED",
        ip_address: ip,
        OR: [{ email }, { email: null }],
        created_at: { gte: since },
      },
    });

    if (count >= maxAttempts) {
      logSecurityEvent({
        eventType: "LOGIN_BRUTE_FORCE",
        ip,
        email,
        severity: "CRITICAL",
        details: {
          attempts: count + 1,
          windowMinutes,
          threshold: maxAttempts,
          message: `Brute force detected: ${count + 1} failed attempts from ${ip} targeting ${email} in ${windowMinutes}min`,
        },
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── 3. APP LOGS ──────────────────────────────────────────────────────

export interface AppLogInput {
  source: AppLogSource;
  level?: LogSeverity;
  message: string;
  details?: any;
  userId?: string | null;
  requestId?: string | null;
  ip?: string | null;
  endpoint?: string | null;
  method?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
}

/**
 * Log an application-level event.
 * Used for API calls, errors, system events, AI usage.
 */
export function logApp(input: AppLogInput): void {
  BUFFER.push({
    type: "app",
    data: {
      id: crypto.randomUUID(),
      source: input.source,
      level: input.level || "INFO",
      message: input.message,
      details: input.details || null,
      user_id: input.userId || null,
      request_id: input.requestId || null,
      ip_address: input.ip || null,
      endpoint: input.endpoint || null,
      method: input.method || null,
      status_code: input.statusCode || null,
      duration_ms: input.durationMs || null,
      created_at: new Date(),
    },
  });
  scheduleFlush();
}

/**
 * Convenience: log an API request automatically.
 */
export function logApiRequest(
  req: any,
  source: AppLogSource,
  statusCode: number,
  durationMs: number,
  opts?: { userId?: string; message?: string; details?: any }
): void {
  const ctx = extractRequestContext(req);
  const url = req?.url || req?.nextUrl?.pathname || "unknown";
  const method = req?.method || "GET";

  logApp({
    source,
    level: statusCode >= 500 ? "CRITICAL" : statusCode >= 400 ? "WARNING" : "INFO",
    message: opts?.message || `${method} ${url} → ${statusCode}`,
    details: opts?.details,
    userId: opts?.userId || ctx.userId || null,
    ip: ctx.ip,
    endpoint: url,
    method,
    statusCode,
    durationMs,
  });
}

// ─── FLUSH CONTROL ────────────────────────────────────────────────────

/**
 * Force flush all pending logs immediately.
 * Useful for shutdown or critical operations.
 */
export async function flushLogs(): Promise<void> {
  await flushBuffer();
}

/**
 * Get buffer stats for monitoring.
 */
export function getLogBufferStats(): { pending: number; isFlushing: boolean } {
  return { pending: BUFFER.length, isFlushing: FLUSHING };
}
