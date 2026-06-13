import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// يستخدم مفتاح Resend المخزّن لإنشاء/جلب نطاق الإرسال وإرجاع سجلات DNS المطلوبة
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const s = await getSettings();
  if (!s.resendApiKey) {
    return NextResponse.json({ error: "احفظ مفتاح Resend أولًا." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action || "create";
  const domain = (typeof body?.domain === "string" ? body.domain : "").trim().toLowerCase();
  const id = typeof body?.id === "string" ? body.id : "";

  const resend = new Resend(s.resendApiKey);

  try {
    if (action === "verify") {
      if (!id) return NextResponse.json({ error: "معرّف النطاق مفقود." }, { status: 400 });
      await resend.domains.verify(id);
      const full: any = await resend.domains.get(id);
      const d = full?.data || {};
      return NextResponse.json({ ok: true, id: d.id, name: d.name, status: d.status, records: d.records || [] });
    }

    // create/get
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      return NextResponse.json({ error: "أدخل نطاقًا صحيحًا مثل dalilai.net" }, { status: 400 });
    }

    // هل النطاق موجود مسبقًا؟
    let found: any = null;
    try {
      const list: any = await resend.domains.list();
      const arr = list?.data?.data || list?.data || [];
      if (Array.isArray(arr)) found = arr.find((x: any) => x?.name === domain);
    } catch {}

    if (!found) {
      const created: any = await resend.domains.create({ name: domain });
      if (created?.error) {
        return NextResponse.json({ error: created.error.message || "تعذّر إنشاء النطاق في Resend." }, { status: 502 });
      }
      found = created?.data;
    }

    if (!found?.id) return NextResponse.json({ error: "لم يُرجع Resend بيانات النطاق." }, { status: 502 });

    const full: any = await resend.domains.get(found.id);
    const d = full?.data || found;
    return NextResponse.json({ ok: true, id: d.id, name: d.name, status: d.status, records: d.records || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطأ في الاتصال بـ Resend." }, { status: 502 });
  }
}
