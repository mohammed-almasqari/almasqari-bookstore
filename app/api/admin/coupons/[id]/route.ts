import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// تعديل جزئي: تفعيل/تعطيل أو تحديث الحقول
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};

  if (typeof body?.active === "boolean") data.active = body.active;
  if (body?.description !== undefined) data.description = (body.description || "").trim() || null;
  if (body?.value !== undefined) {
    const v = Math.round(Number(body.value));
    if (Number.isFinite(v) && v > 0) data.value = v;
  }
  if (body?.maxUses !== undefined) {
    data.maxUses = body.maxUses === "" || body.maxUses == null ? null : Math.max(1, Math.round(Number(body.maxUses)));
  }
  if (body?.minCents !== undefined) data.minCents = Math.max(0, Math.round(Number(body.minCents) || 0));
  if (body?.expiresAt !== undefined) {
    const d = body.expiresAt ? new Date(body.expiresAt) : null;
    data.expiresAt = d && !isNaN(d.getTime()) ? d : null;
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "لا تغييرات." }, { status: 400 });

  await prisma.coupon.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  await prisma.coupon.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
