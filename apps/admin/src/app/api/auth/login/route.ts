import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@cuti/db";
import { logSecurityEvent, logApp, extractRequestContext, detectBruteForce } from "@cuti/db/logger";
import { signAdminSession } from "@/lib/admin-session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in database with accounts
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        accounts: {
          where: { provider_id: "credential" },
        },
      },
    });

    const ctx = extractRequestContext(req);
    if (!user) {
      logSecurityEvent({ eventType: 'LOGIN_FAILED', ip: ctx.ip, userAgent: ctx.userAgent, email: cleanEmail, severity: 'WARNING', details: { reason: 'user_not_found', portal: 'admin' } });
      return NextResponse.json(
        { success: false, message: "Email tidak terdaftar." },
        { status: 401 }
      );
    }

    // Check admin role
    if (user.role !== "ADMIN") {
      logSecurityEvent({ eventType: 'UNAUTHORIZED_ACCESS', ip: ctx.ip, userAgent: ctx.userAgent, email: cleanEmail, userId: user.id, severity: 'CRITICAL', details: { reason: 'non_admin_login_attempt', portal: 'admin' } });
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya admin yang dapat masuk." },
        { status: 403 }
      );
    }

    const account = user.accounts[0];
    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, message: "Akun ini tidak memiliki kata sandi." },
        { status: 401 }
      );
    }

    // Verify password
    const parts = account.password.split(":");
    if (parts.length !== 2) {
      return NextResponse.json(
        { success: false, message: "Kata sandi tidak valid." },
        { status: 401 }
      );
    }

    const [salt, originalHash] = parts;
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");

    if (testHash !== originalHash) {
      logSecurityEvent({ eventType: 'LOGIN_FAILED', ip: ctx.ip, userAgent: ctx.userAgent, email: cleanEmail, userId: user.id, severity: 'WARNING', details: { reason: 'invalid_password', portal: 'admin' } });
      if (ctx.ip) await detectBruteForce(ctx.ip, cleanEmail);
      return NextResponse.json(
        { success: false, message: "Kata sandi salah." },
        { status: 401 }
      );
    }

    logSecurityEvent({ eventType: 'LOGIN_SUCCESS', ip: ctx.ip, userAgent: ctx.userAgent, email: cleanEmail, userId: user.id, severity: 'INFO', details: { portal: 'admin' } });
    logApp({ source: 'ADMIN', level: 'INFO', message: `Admin login: ${cleanEmail}`, ip: ctx.ip, endpoint: '/api/auth/login', method: 'POST', statusCode: 200, userId: user.id });

    const adminData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await signAdminSession(adminData);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      data: adminData,
    });

    // Set signed admin session cookie (7 days)
    const sevenDays = 7 * 24 * 60 * 60;
    response.cookies.set({
      name: "cuti_admin_session",
      value: token,
      maxAge: sevenDays,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("[Admin Login] Error:", error);
    const detailMsg = error?.message ? `: ${error.message}` : "";
    return NextResponse.json(
      { 
        success: false, 
        message: `Terjadi kesalahan sistem saat login${detailMsg}`,
        error: error?.message,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}
