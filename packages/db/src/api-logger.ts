/**
 * API Request Logger Middleware
 *
 * Wraps Next.js route handlers to automatically log every API request
 * with timing, status code, user context, and error details.
 *
 * Usage in route handlers:
 *   import { withApiLog } from "@cuti/db/api-logger";
 *   export const GET = withApiLog(async (req) => { ... }, "AUTH");
 */

import { NextRequest, NextResponse } from "next/server";
import { AppLogSource, LogSeverity } from "./generated/client/index.js";
import { logApp, extractRequestContext } from "./logger.ts";

type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wraps a route handler with automatic request logging.
 * Logs request start (optional), completion with timing, and errors.
 */
export function withApiLog(
  handler: RouteHandler,
  source: AppLogSource = "API",
  opts?: { logStart?: boolean }
): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    const startTime = performance.now();
    const ctx = extractRequestContext(req);
    const url = req.nextUrl?.pathname || req.url;
    const method = req.method;
    const requestId = crypto.randomUUID().slice(0, 8);

    // Optionally log request start
    if (opts?.logStart) {
      logApp({
        source,
        level: "DEBUG",
        message: `${method} ${url} started`,
        ip: ctx.ip,
        endpoint: url,
        method,
        requestId,
      });
    }

    try {
      const response = await handler(req, context);
      const durationMs = Math.round(performance.now() - startTime);
      const statusCode = response.status;

      // Log completion
      logApp({
        source,
        level: statusCode >= 500 ? "ERROR" : statusCode >= 400 ? "WARNING" : "INFO",
        message: `${method} ${url} → ${statusCode} (${durationMs}ms)`,
        ip: ctx.ip,
        endpoint: url,
        method,
        statusCode,
        durationMs,
        requestId,
        details: statusCode >= 400 ? { status: statusCode } : undefined,
      });

      return response;
    } catch (error: any) {
      const durationMs = Math.round(performance.now() - startTime);

      // Log error
      logApp({
        source,
        level: "ERROR",
        message: `${method} ${url} → 500 (${durationMs}ms) — ${error?.message || "Unknown error"}`,
        ip: ctx.ip,
        endpoint: url,
        method,
        statusCode: 500,
        durationMs,
        requestId,
        details: {
          error: error?.message,
          stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
        },
      });

      // Re-throw so Next.js handles the error response
      throw error;
    }
  };
}
