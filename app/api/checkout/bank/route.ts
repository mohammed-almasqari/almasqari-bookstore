import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { validateCoupon } from "@/lib/coupons";
import { resolveBundle } from "@/lib/bundles";

export const dynamic = "force-dynamic";

const schema = z.object({
  bookId: z.string().min(1).optional(),
  seriesId: z.string().min(1).optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  reference: z.string().trim().max(200).optional(),
  coupon: z.string().trim().max(40).optional(),
  ref: z.string().trim().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const settings = await getSettings();
  if (!settings.bankEnabled) {
    return NextResponse.json({ error: "الدفع بتحويل بنكي غير مفعّل." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const { name, reference } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  // تحديد هدف الشراء: حزمة سلسلة أو كتاب مفرد
  let basePriceCents: number;
  let currency: string;
  let bookId: string;
  let seriesId: string | null = null;

  if (parsed.data.seriesId) {
    const bundle = await resolveBundle(parsed.data.seriesId);
    if (!bundle) return NextResponse.json({ error: "الحزمة غير متاحة للشراء." }, { status: 404 });
    basePriceCents = bundle.priceCents;
    currency = bundle.currency;
    bookId = bundle.firstBookId;
    seriesId = bundle.seriesId;
  } else if (parsed.data.bookId) {
    const book = await prisma.book.findFirst({ where: { id: parsed.data.bookId, isFree: false, isPublished: true } });
    if (!book) return NextResponse.json({ error: "الكتاب غير متاح للشراء." }, { status: 404 });
    basePriceCents = book.priceCents;
    currency = book.currency;
    bookId = book.id;
  } else {
    return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });
  }

  // تطبيق كوبون الخصم (إن وُجد)
  let amountCents = basePriceCents;
  let couponCode: string | null = null;
  let discountCents = 0;
  if (parsed.data.coupon) {
    const c = await validateCoupon(parsed.data.coupon, basePriceCents, currency);
    if (!c.ok) return NextResponse.json({ error: c.error }, { status: 400 });
    amountCents = c.finalCents;
    discountCents = c.discountCents;
    couponCode = c.code;
  }
  const referralCode = parsed.data.ref ? parsed.data.ref.trim().toUpperCase().slice(0, 40) : null;

  await prisma.order.create({
    data: {
      bookId,
      seriesId,
      customerName: name,
      customerEmail: email,
      amountCents,
      currency,
      status: "PENDING",
      paymentMethod: "BANK",
      bankReference: reference || null,
      couponCode,
      discountCents,
      referralCode,
    },
  });

  return NextResponse.json({ ok: true });
}
