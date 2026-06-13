import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { normalizeRef } from "@/lib/referrals";

export const dynamic = "force-dynamic";

function randomCode(len = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function uniqueCode(preferred: string): Promise<string> {
  let base = normalizeRef(preferred).replace(/[^A-Z0-9_-]/g, "");
  if (base.length < 3) base = "REF" + randomCode(4);
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    const ex = await prisma.referral.findUnique({ where: { code: candidate } });
    if (!ex) return candidate;
    candidate = `${base}${randomCode(2)}`;
  }
  return `${base}${Date.now().toString().slice(-4)}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const referrals = await prisma.referral.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ referrals });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "اسم الشريك مطلوب." }, { status: 400 });

  const commissionPercent = Math.min(100, Math.max(0, Math.round(Number(body?.commissionPercent) || 20)));
  const code = await uniqueCode(body?.code || name);

  const created = await prisma.referral.create({
    data: {
      code,
      name,
      email: (body?.email || "").trim() || null,
      commissionPercent,
      active: body?.active === false ? false : true,
    },
  });
  return NextResponse.json({ ok: true, id: created.id, code: created.code });
}
