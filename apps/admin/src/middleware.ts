import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-session";

export async function middleware(req: NextRequest) {
  // Allow CORS preflight requests without authentication
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") || "*";
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const { pathname } = req.nextUrl;

  // Allow login page, login API, public tracking endpoint, public pre-register endpoint, and static assets
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/track" ||
    pathname === "/api/pre-register" ||
    pathname === "/site.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|webmanifest|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check admin session cookie
  const sessionCookie = req.cookies.get("cuti_admin_session")?.value;

  if (!sessionCookie) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin diperlukan." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const admin = await verifyAdminSession(sessionCookie);

  if (!admin || admin.role !== "ADMIN") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Sesi admin tidak valid atau kedaluwarsa." },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|site.webmanifest|logo.*|logo-minimize.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest)$).*)",
  ],
};
