import { prisma } from "@/lib/db";
import { createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";
import { formatPrice, formatDate } from "@/lib/format";
import { sendReceiptEmail, sendDeliveryEmail, sendBundleDeliveryEmail } from "@/lib/email/send";

export const EXPIRY_DAYS = 30;
const expiresLabel = `${EXPIRY_DAYS} يومًا`;

type FulfillableOrder = {
  id: string;
  bookId: string;
  seriesId: string | null;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  createdAt: Date;
  book: { title: string; guideFile?: string | null };
  series?: { title: string } | null;
};

/**
 * يُنشئ روابط التحميل ويرسل رسائل الإيصال والتسليم لطلب مدفوع.
 * يدعم الكتاب المفرد وحزمة السلسلة (كل كتبها المنشورة).
 * يُرجع رابط التحميل الأساسي (لعرضه للعميل مباشرة).
 */
export async function fulfillOrder(order: FulfillableOrder): Promise<string> {
  // حزمة سلسلة: سلّم كل كتب السلسلة المنشورة
  if (order.seriesId) {
    const books = await prisma.book.findMany({
      where: { seriesId: order.seriesId, isPublished: true },
      orderBy: { seriesOrder: "asc" },
      select: { id: true, title: true },
    });

    const list: { title: string; downloadUrl: string }[] = [];
    for (const b of books) {
      const t = await createDownloadToken({ bookId: b.id, email: order.customerEmail, orderId: order.id, days: EXPIRY_DAYS });
      list.push({ title: b.title, downloadUrl: absoluteUrl(`/api/download/${t.token}`) });
    }

    const seriesTitle = order.series?.title || "السلسلة";
    const primaryUrl = list[0]?.downloadUrl || absoluteUrl("/account");

    await Promise.allSettled([
      sendReceiptEmail(order.customerEmail, {
        name: order.customerName,
        bookTitle: `حزمة «${seriesTitle}» — ${books.length} كتب`,
        amount: formatPrice(order.amountCents, order.currency),
        orderId: order.id,
        date: formatDate(order.createdAt),
        downloadUrl: primaryUrl,
      }),
      sendBundleDeliveryEmail(order.customerEmail, {
        name: order.customerName,
        seriesTitle,
        books: list,
        expiresLabel,
      }),
    ]);

    return primaryUrl;
  }

  // كتاب مفرد
  const dl = await createDownloadToken({ bookId: order.bookId, email: order.customerEmail, orderId: order.id, days: EXPIRY_DAYS });
  const downloadUrl = absoluteUrl(`/api/download/${dl.token}`);
  const guideUrl = order.book.guideFile ? absoluteUrl(`/api/download/${dl.token}?type=guide`) : undefined;

  await Promise.allSettled([
    sendReceiptEmail(order.customerEmail, {
      name: order.customerName,
      bookTitle: order.book.title,
      amount: formatPrice(order.amountCents, order.currency),
      orderId: order.id,
      date: formatDate(order.createdAt),
      downloadUrl,
    }),
    sendDeliveryEmail(order.customerEmail, {
      name: order.customerName,
      bookTitle: order.book.title,
      downloadUrl,
      expiresLabel,
      paid: true,
      guideUrl,
    }),
  ]);

  return downloadUrl;
}
