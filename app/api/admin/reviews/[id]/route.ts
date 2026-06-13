import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  await prisma.review.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

// تبديل حالة الاعتماد (إظهار/إخفاء)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const updated = await prisma.review.update({
    where: { id: params.id },
    data: { approved: !!body.approved },
  });
  return NextResponse.json({ ok: true, approved: updated.approved });
}
