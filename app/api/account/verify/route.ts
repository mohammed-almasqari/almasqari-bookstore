import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, createCustomerSessionToken, CUSTOMER_COOKIE, CUSTOMER_SESSION_AGE } from "@/lib/customer-auth";
import { absoluteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

// يتحقق من الرمز السحري، يضبط كوكي جلسة العميل على الاستجابة، ثم يحوّل إلى صفحة الحساب
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = token ? await verifyMagicToken(token) : null;

  if (!email) {
    return NextResponse.redirect(absoluteUrl("/account?error=link"));
  }

  const res = NextResponse.redirect(absoluteUrl("/account"));
  const sessionToken = await createCustomerSessionToken(email);
  res.cookies.set(CUSTOMER_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_AGE,
  });
  return res;
}
