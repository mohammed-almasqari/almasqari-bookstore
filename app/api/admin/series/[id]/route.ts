import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const s = await prisma.series.findUnique({ where: { id: params.id } });
  if (!s) return NextResponse.json({ error: "السلسلة غير موجودة." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if ("description" in body) data.description = (body.description || "").trim() || null;
  if ("sortOrder" in body) data.sortOrder = Number(body.sortOrder) || 0;
  if ("isPublished" in body) data.isPublished = !!body.isPublished;
  if ("bundlePriceCents" in body) data.bundlePriceCents = Math.max(0, Math.round(Number(body.bundlePriceCents) || 0));

  const updated = await prisma.series.update({ where: { id: s.id }, data });
  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  // فصل الكتب عن السلسلة قبل الحذف (onDelete: SetNull يتكفّل بذلك أيضًا)
  await prisma.book.updateMany({ where: { seriesId: params.id }, data: { seriesId: null } });
  await prisma.series.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
