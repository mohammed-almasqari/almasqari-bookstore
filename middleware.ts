import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// تحقق خفيف من الجلسة على edge (jose فقط، بدون prisma/bcrypt)
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-insecure-secret-change-me");

async function isValid(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isValid(req.cookies.get("admin_session")?.value);

  // مسارات API الإدارية
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
      return NextResponse.next();
    }
    if (!authed) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    return NextResponse.next();
  }

  // صفحات لوحة التحكم
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return authed ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
    }
    if (!authed) {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
