import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";
import { formatPrice, formatDate } from "@/lib/format";
import { sendReceiptEmail, sendDeliveryEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";
const EXPIRY_DAYS = 30;

// المدير يؤكّد استلام التحويل البنكي → تحويل الطلب إلى مدفوع وإرسال الكتاب
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { book: true } });
  if (!order) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  if (order.status === "PAID") return NextResponse.json({ ok: true, already: true });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
    include: { book: true },
  });

  const dl = await createDownloadToken({
    bookId: updated.bookId,
    email: updated.customerEmail,
    orderId: updated.id,
    days: EXPIRY_DAYS,
  });
  const downloadUrl = absoluteUrl(`/api/download/${dl.token}`);

  await Promise.allSettled([
    sendReceiptEmail(updated.customerEmail, {
      name: updated.customerName,
      bookTitle: updated.book.title,
      amount: formatPrice(updated.amountCents, updated.currency),
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

  return NextResponse.json({ ok: true });
}
