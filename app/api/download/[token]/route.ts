import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/db";
import { readBookFile, contentTypeFor } from "@/lib/storage";

export const dynamic = "force-dynamic";

function errorPage(title: string, message: string, status: number) {
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>body{font-family:Tajawal,Arial,sans-serif;background:#FBF7F0;color:#1E1B2E;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}
  .box{background:#fff;border:1px solid #EADCC6;border-radius:20px;padding:40px;max-width:440px;box-shadow:0 10px 40px -12px rgba(30,27,46,.25)}
  h1{font-size:22px;margin:0 0 12px}p{color:#4B475F;line-height:1.9;margin:0 0 18px}
  a{display:inline-block;background:#D97706;color:#fff;text-decoration:none;padding:12px 26px;border-radius:12px;font-weight:700}</style>
  </head><body><div class="box"><div style="font-size:42px">🔒</div><h1>${title}</h1><p>${message}</p>
  <a href="/free">العودة للكتب المجانية</a></div></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const dl = await prisma.downloadToken.findUnique({
    where: { token: params.token },
    include: { book: true },
  });

  if (!dl) {
    return errorPage("رابط غير صالح", "رابط التحميل غير صحيح. تأكد من نسخه كاملًا من بريدك.", 404);
  }
  if (dl.expiresAt < new Date()) {
    return errorPage("انتهت صلاحية الرابط", "انتهت صلاحية رابط التحميل. سجّل من جديد للحصول على رابط جديد.", 410);
  }
  if (dl.downloadCount >= dl.maxDownloads) {
    return errorPage("تجاوزت حد التحميل", "تم الوصول للحد الأقصى لعدد مرات التحميل لهذا الرابط.", 429);
  }
  if (!dl.book.bookFile) {
    return errorPage("الكتاب قيد التجهيز", "ملف الكتاب لم يُرفع بعد. سيصلك فور جهوزيته بإذن الله.", 409);
  }

  let buffer: Buffer;
  try {
    buffer = await readBookFile(dl.book.bookFile);
  } catch {
    return errorPage("تعذّر الوصول للملف", "حدث خطأ أثناء جلب الملف. يرجى المحاولة لاحقًا.", 500);
  }

  // زيادة العدّاد بعد نجاح القراءة
  await prisma.downloadToken.update({
    where: { id: dl.id },
    data: { downloadCount: { increment: 1 } },
  });

  const ext = path.extname(dl.book.bookFile) || ".pdf";
  const safeName = encodeURIComponent(`${dl.book.title}${ext}`);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(dl.book.bookFile),
      "Content-Disposition": `attachment; filename="book${ext}"; filename*=UTF-8''${safeName}`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
