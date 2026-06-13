import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const schema = z.object({
  bookId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  reference: z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const settings = await getSettings();
  if (!settings.bankEnabled) {
    return NextResponse.json({ error: "الدفع بتحويل بنكي غير مفعّل." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const { bookId, name, reference } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const book = await prisma.book.findFirst({ where: { id: bookId, isFree: false, isPublished: true } });
  if (!book) return NextResponse.json({ error: "الكتاب غير متاح للشراء." }, { status: 404 });

  await prisma.order.create({
    data: {
      bookId: book.id,
      customerName: name,
      customerEmail: email,
      amountCents: book.priceCents,
      currency: book.currency,
      status: "PENDING",
      paymentMethod: "BANK",
      bankReference: reference || null,
    },
  });

  return NextResponse.json({ ok: true });
}
