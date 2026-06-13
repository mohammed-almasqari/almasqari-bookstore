import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createPayPalOrder, isPayPalReady } from "@/lib/paypal";
import { priceToDecimalString } from "@/lib/format";
import { validateCoupon } from "@/lib/coupons";
import { resolveBundle } from "@/lib/bundles";

export const dynamic = "force-dynamic";

const schema = z.object({
  bookId: z.string().min(1).optional(),
  seriesId: z.string().min(1).optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  coupon: z.string().trim().max(40).optional(),
  ref: z.string().trim().max(40).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await isPayPalReady())) {
    return NextResponse.json({ error: "بوابة الدفع عبر PayPal غير مفعّلة." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const { name } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  // تحديد هدف الشراء: حزمة سلسلة أو كتاب مفرد
  let title: string;
  let basePriceCents: number;
  let currency: string;
  let bookId: string;
  let seriesId: string | null = null;

  if (parsed.data.seriesId) {
    const bundle = await resolveBundle(parsed.data.seriesId);
    if (!bundle) return NextResponse.json({ error: "الحزمة غير متاحة للشراء." }, { status: 404 });
    title = `حزمة سلسلة «${bundle.title}»`;
    basePriceCents = bundle.priceCents;
    currency = bundle.currency;
    bookId = bundle.firstBookId;
    seriesId = bundle.seriesId;
  } else if (parsed.data.bookId) {
    const book = await prisma.book.findFirst({ where: { id: parsed.data.bookId, isFree: false, isPublished: true } });
    if (!book) return NextResponse.json({ error: "الكتاب غير متاح للشراء." }, { status: 404 });
    if (book.priceCents <= 0) return NextResponse.json({ error: "سعر الكتاب غير صالح." }, { status: 400 });
    title = book.title;
    basePriceCents = book.priceCents;
    currency = book.currency;
    bookId = book.id;
  } else {
    return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });
  }

  // تطبيق كوبون الخصم (إن وُجد) — تحقّق من جانب الخادم دائمًا
  let chargeCents = basePriceCents;
  let couponCode: string | null = null;
  let discountCents = 0;
  if (parsed.data.coupon) {
    const c = await validateCoupon(parsed.data.coupon, basePriceCents, currency);
    if (!c.ok) return NextResponse.json({ error: c.error }, { status: 400 });
    chargeCents = c.finalCents;
    discountCents = c.discountCents;
    couponCode = c.code;
  }
  const referralCode = parsed.data.ref ? parsed.data.ref.trim().toUpperCase().slice(0, 40) : null;

  try {
    const amount = priceToDecimalString(chargeCents);
    const ppOrder = await createPayPalOrder({
      amount,
      currency,
      bookTitle: title,
      referenceId: seriesId || bookId,
    });

    await prisma.order.create({
      data: {
        bookId,
        seriesId,
        customerName: name,
        customerEmail: email,
        amountCents: chargeCents,
        currency,
        status: "PENDING",
        paypalOrderId: ppOrder.id,
        couponCode,
        discountCents,
        referralCode,
      },
    });

    return NextResponse.json({ paypalOrderId: ppOrder.id });
  } catch (e) {
    console.error("[checkout] create order error:", e);
    return NextResponse.json({ error: "تعذّر بدء عملية الدفع. حاول لاحقًا." }, { status: 502 });
  }
}
