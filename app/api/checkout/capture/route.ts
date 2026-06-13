import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";
import { incrementCouponUse } from "@/lib/coupons";
import { fulfillOrder, EXPIRY_DAYS } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

const schema = z.object({
  paypalOrderId: z.string().min(1),
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().max(160).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const { paypalOrderId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { paypalOrderId },
    include: { book: true, series: true },
  });
  if (!order) return NextResponse.json({ error: "لم يُعثر على الطلب." }, { status: 404 });

  // إن سبق إتمام الطلب، أعد رابط التحميل دون تحصيل مزدوج
  if (order.status === "PAID") {
    const existing = await prisma.downloadToken.findFirst({
      where: { orderId: order.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    const token = existing ?? (await createDownloadToken({
      bookId: order.bookId,
      email: order.customerEmail,
      orderId: order.id,
      days: EXPIRY_DAYS,
    }));
    return NextResponse.json({ ok: true, downloadUrl: absoluteUrl(`/api/download/${token.token}`) });
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);
    if (capture.status !== "COMPLETED") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "لم يكتمل الدفع." }, { status: 402 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", paypalCaptureId: capture.captureId },
      include: { book: true, series: true },
    });

    // تثبيت استخدام الكوبون بعد اكتمال الدفع فعليًا
    await incrementCouponUse(updated.couponCode);

    // إنشاء روابط التحميل وإرسال الإيصال والتسليم (كتاب مفرد أو حزمة)
    const downloadUrl = await fulfillOrder(updated);

    return NextResponse.json({ ok: true, downloadUrl });
  } catch (e) {
    console.error("[checkout] capture error:", e);
    return NextResponse.json({ error: "تعذّر تأكيد الدفع." }, { status: 502 });
  }
}
