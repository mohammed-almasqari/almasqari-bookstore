import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendTestEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

function errMessage(e: any): string {
  if (!e) return "خطأ غير معروف";
  if (typeof e === "string") return e;
  return e.message || e.error || e.name || JSON.stringify(e).slice(0, 300);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const to = (typeof body?.to === "string" && body.to.trim()) || session.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "أدخل بريدًا صحيحًا للاختبار." }, { status: 400 });
  }

  const result: any = await sendTestEmail(to);

  if (result?.ok) {
    return NextResponse.json({ ok: true, to, id: result.id });
  }
  if (result?.skipped) {
    return NextResponse.json({ ok: false, error: "مفتاح Resend غير مضبوط في الإعدادات." }, { status: 400 });
  }
  return NextResponse.json({ ok: false, to, error: errMessage(result?.error) }, { status: 502 });
}
