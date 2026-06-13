import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  subject: z.string().trim().min(2).max(160),
  body: z.string().trim().min(5).max(8000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "أدخل عنوانًا ونصًّا صحيحين." }, { status: 400 });

  const subs = await prisma.freeClaim.findMany({
    where: { confirmed: true, optInUpdates: true },
    distinct: ["email"],
    select: { email: true },
  });
  const emails = subs.map((s) => s.email);
  if (emails.length === 0) return NextResponse.json({ ok: true, total: 0, sent: 0 });

  let sent = 0;
  const chunk = 8;
  for (let i = 0; i < emails.length; i += chunk) {
    const slice = emails.slice(i, i + chunk);
    const results = await Promise.allSettled(
      slice.map((to) => sendNewsletterEmail(to, { subject: parsed.data.subject, body: parsed.data.body }))
    );
    sent += results.filter((r) => r.status === "fulfilled" && (r.value as any)?.ok).length;
  }

  return NextResponse.json({ ok: true, total: emails.length, sent });
}
