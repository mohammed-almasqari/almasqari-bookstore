import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth";
import { absoluteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

function clearOn(res: NextResponse) {
  res.cookies.set(CUSTOMER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function POST() {
  return clearOn(NextResponse.json({ ok: true }));
}

export async function GET() {
  return clearOn(NextResponse.redirect(absoluteUrl("/account")));
}
