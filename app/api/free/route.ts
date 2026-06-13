import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { confirmToken, createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";
import { sendConfirmEmail, sendDeliveryEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

const schema = z.object({
  bookId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  optIn: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة، تأكد من الاسم والبريد." }, { status: 400 });
  }
  const { bookId, name, optIn } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const book = await prisma.book.findFirst({
    where: { id: bookId, isFree: true, isPublished: true },
  });
  if (!book) return NextResponse.json({ error: "هذا الكتاب غير متاح مجانًا حاليًا." }, { status: 404 });

  const existing = await prisma.freeClaim.findUnique({
    where: { bookId_email: { bookId, email } },
  });

  // مستخدم سبق وأكّد بريده — أعد إرسال رابط التحميل مباشرة
  if (existing?.confirmed) {
    let dl = await prisma.downloadToken.findFirst({
      where: { freeClaimId: existing.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!dl) {
      dl = await createDownloadToken({ bookId, email, freeClaimId: existing.id, days: 30 });
    }
    await sendDeliveryEmail(email, {
      name: existing.name,
      bookTitle: book.title,
      downloadUrl: absoluteUrl(`/api/download/${dl.token}`),
      expiresLabel: "30 يومًا",
      paid: false,
    });
    return NextResponse.json({ ok: true, resent: true });
  }

  // تسجيل جديد أو غير مؤكَّد — أرسل رابط التأكيد
  const tok = confirmToken();
  if (existing) {
    await prisma.freeClaim.update({
      where: { id: existing.id },
      data: { name, confirmToken: tok, optInUpdates: optIn ?? true },
    });
  } else {
    await prisma.freeClaim.create({
      data: {
        bookId,
        name,
        email,
        confirmToken: tok,
        optInUpdates: optIn ?? true,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      },
    });
  }

  await sendConfirmEmail(email, {
    name,
    bookTitle: book.title,
    confirmUrl: absoluteUrl(`/free/confirm?token=${tok}`),
  });

  return NextResponse.json({ ok: true });
}
