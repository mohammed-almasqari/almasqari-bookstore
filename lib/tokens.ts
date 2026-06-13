import crypto from "crypto";
import { prisma } from "./db";

// رمز عشوائي آمن (سداسي عشري)
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// إنشاء رمز تحميل آمن مرتبط بكتاب وطلب أو تسجيل مجاني
export async function createDownloadToken(opts: {
  bookId: string;
  email: string;
  orderId?: string;
  freeClaimId?: string;
  days?: number;
  maxDownloads?: number;
}) {
  const expiresAt = new Date(Date.now() + (opts.days ?? 30) * 24 * 60 * 60 * 1000);
  return prisma.downloadToken.create({
    data: {
      token: randomToken(24),
      bookId: opts.bookId,
      email: opts.email.toLowerCase().trim(),
      orderId: opts.orderId,
      freeClaimId: opts.freeClaimId,
      maxDownloads: opts.maxDownloads ?? 6,
      expiresAt,
    },
  });
}

// رمز تأكيد بريد قصير ومناسب للروابط
export function confirmToken(): string {
  return randomToken(20);
}
