import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.active === "boolean") data.active = body.active;
  if (body?.name !== undefined && String(body.name).trim()) data.name = String(body.name).trim();
  if (body?.email !== undefined) data.email = (body.email || "").trim() || null;
  if (body?.commissionPercent !== undefined) {
    data.commissionPercent = Math.min(100, Math.max(0, Math.round(Number(body.commissionPercent) || 0)));
  }
  // إعادة تصفير الرصيد (بعد دفع المستحقات للشريك)
  if (body?.resetEarnings === true) {
    data.earningsCents = 0;
    data.orders = 0;
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "لا تغييرات." }, { status: 400 });

  await prisma.referral.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  await prisma.referral.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
