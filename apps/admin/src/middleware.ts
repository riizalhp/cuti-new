import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and API routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check admin session cookie
  const sessionCookie = req.cookies.get("cuti_admin_session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = decodeURIComponent(sessionCookie);
    const session = JSON.parse(decoded);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.*|logo-minimize.*).*)"],
};
