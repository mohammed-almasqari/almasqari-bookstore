import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createMagicToken } from "@/lib/customer-auth";
import { absoluteUrl } from "@/lib/env";
import { sendLoginLinkEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email().max(160) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "أدخل بريدًا صحيحًا." }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();

  // هل يملك هذا البريد أي مشتريات أو كتب مجانية مؤكَّدة؟
  const [order, claim] = await Promise.all([
    prisma.order.findFirst({ where: { customerEmail: email, status: "PAID" }, orderBy: { createdAt: "desc" } }),
    prisma.freeClaim.findFirst({ where: { email, confirmed: true }, orderBy: { createdAt: "desc" } }),
  ]);

  // لأسباب أمنية لا نكشف إن كان البريد مسجّلًا أم لا — نعيد ok دائمًا
  if (order || claim) {
    const name = order?.customerName || claim?.name || undefined;
    const token = await createMagicToken(email);
    await sendLoginLinkEmail(email, {
      name,
      loginUrl: absoluteUrl(`/api/account/verify?token=${token}`),
    });
  }

  return NextResponse.json({ ok: true });
}
