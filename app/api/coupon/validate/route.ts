import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCoupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  bookId: z.string().min(1),
});

// نقطة عامة: يستدعيها المتجر للتحقق من كوبون وحساب السعر بعد الخصم
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "بيانات غير صحيحة." }, { status: 400 });

  const book = await prisma.book.findFirst({
    where: { id: parsed.data.bookId, isFree: false, isPublished: true },
    select: { priceCents: true, currency: true },
  });
  if (!book || book.priceCents <= 0) {
    return NextResponse.json({ ok: false, error: "الكتاب غير متاح للشراء." }, { status: 404 });
  }

  const result = await validateCoupon(parsed.data.code, book.priceCents, book.currency);
  if (!result.ok) return NextResponse.json(result, { status: 200 });

  return NextResponse.json({
    ok: true,
    code: result.code,
    discountCents: result.discountCents,
    finalCents: result.finalCents,
    discountLabel: result.discountLabel,
    finalLabel: result.finalLabel,
  });
}
