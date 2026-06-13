import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { testPayPalCredentials } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const r = await testPayPalCredentials();
  if (r.ok) {
    return NextResponse.json({ ok: true, env: r.env });
  }

  // رسالة مبسّطة حسب نوع الخطأ
  const raw = r.error || "";
  let friendly = raw;
  if (raw.includes("invalid_client") || raw.includes("Client Authentication failed")) {
    friendly = `فشل التحقق من المفاتيح: غير صحيحة أو لا تطابق البيئة المختارة (${r.env === "live" ? "مباشر Live" : "تجريبي Sandbox"}). تأكّد أن Client ID و Secret من نفس التطبيق ومن نفس البيئة، وأعد إدخالهما بدقة.`;
  }
  return NextResponse.json({ ok: false, env: r.env, error: friendly }, { status: 400 });
}
