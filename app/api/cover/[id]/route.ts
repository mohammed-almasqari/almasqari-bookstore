import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readCoverFile, contentTypeFor } from "@/lib/storage";

export const dynamic = "force-dynamic";

// يخدم صورة غلاف الكتاب (عامة) من مجلد الرفع
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    select: { coverFile: true },
  });

  if (!book?.coverFile) {
    return NextResponse.json({ error: "no cover" }, { status: 404 });
  }

  // ETag مبني على اسم ملف الغلاف (يتغيّر عند كل رفع جديد) ليُحدَّث التخزين المؤقت فورًا
  const etag = `"${book.coverFile}"`;
  const cacheControl = "public, max-age=0, must-revalidate";
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
  }

  try {
    const buffer = await readCoverFile(book.coverFile);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(book.coverFile),
        "Cache-Control": cacheControl,
        ETag: etag,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
