import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal";
import { createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";
import { formatPrice, formatDate } from "@/lib/format";
import { sendReceiptEmail, sendDeliveryEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

const schema = z.object({
  paypalOrderId: z.string().min(1),
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().max(160).optional(),
});

const EXPIRY_DAYS = 30;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const { paypalOrderId } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { paypalOrderId },
    include: { book: true },
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
      include: { book: true },
    });

    const dl = await createDownloadToken({
      bookId: updated.bookId,
      email: updated.customerEmail,
      orderId: updated.id,
      days: EXPIRY_DAYS,
    });
    const downloadUrl = absoluteUrl(`/api/download/${dl.token}`);
    const amountLabel = formatPrice(updated.amountCents, updated.currency);

    // إيصال الشراء + تسليم الكتاب
    await Promise.allSettled([
      sendReceiptEmail(updated.customerEmail, {
        name: updated.customerName,
        bookTitle: updated.book.title,
        amount: amountLabel,
        orderId: updated.id,
        date: formatDate(updated.createdAt),
        downloadUrl,
      }),
      sendDeliveryEmail(updated.customerEmail, {
        name: updated.customerName,
        bookTitle: updated.book.title,
        downloadUrl,
        expiresLabel: `${EXPIRY_DAYS} يومًا`,
        paid: true,
      }),
    ]);

    return NextResponse.json({ ok: true, downloadUrl });
  } catch (e) {
    console.error("[checkout] capture error:", e);
    return NextResponse.json({ error: "تعذّر تأكيد الدفع." }, { status: 502 });
  }
}
