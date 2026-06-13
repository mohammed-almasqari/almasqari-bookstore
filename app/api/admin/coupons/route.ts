import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { normalizeCode } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const code = normalizeCode(body?.code || "");
  const type = body?.type === "FIXED" ? "FIXED" : "PERCENT";
  const value = Math.round(Number(body?.value));

  if (code.length < 2) return NextResponse.json({ error: "رمز الكوبون مطلوب (حرفان على الأقل)." }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "قيمة الخصم غير صالحة." }, { status: 400 });
  if (type === "PERCENT" && value > 100) return NextResponse.json({ error: "نسبة الخصم لا تتجاوز 100%." }, { status: 400 });

  const exists = await prisma.coupon.findUnique({ where: { code } });
  if (exists) return NextResponse.json({ error: "هذا الرمز مستخدم بالفعل." }, { status: 409 });

  const maxUsesRaw = body?.maxUses;
  const maxUses = maxUsesRaw === "" || maxUsesRaw == null ? null : Math.max(1, Math.round(Number(maxUsesRaw)));
  const minCents = Math.max(0, Math.round(Number(body?.minCents) || 0));
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  const created = await prisma.coupon.create({
    data: {
      code,
      description: (body?.description || "").trim() || null,
      type,
      value: type === "FIXED" ? value : Math.min(100, value),
      maxUses: maxUses && Number.isFinite(maxUses) ? maxUses : null,
      minCents,
      expiresAt: expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null,
      active: body?.active === false ? false : true,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
