import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل." }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.uid } });
  if (!admin) return NextResponse.json({ error: "الحساب غير موجود." }, { status: 404 });

  const ok = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة." }, { status: 403 });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
