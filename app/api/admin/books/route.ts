import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { saveBookFile, saveCoverFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}
function bool(fd: FormData, k: string): boolean {
  const v = fd.get(k);
  return v === "true" || v === "on" || v === "1";
}
function num(fd: FormData, k: string, def = 0): number {
  const n = Number(str(fd, k));
  return Number.isFinite(n) ? n : def;
}
function file(fd: FormData, k: string): File | null {
  const v = fd.get(k);
  return v instanceof File && v.size > 0 ? v : null;
}

export async function POST(req: NextRequest) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const title = str(fd, "title");
  const description = str(fd, "description");
  if (title.length < 2) return NextResponse.json({ error: "عنوان الكتاب مطلوب." }, { status: 400 });
  if (description.length < 5) return NextResponse.json({ error: "وصف الكتاب مطلوب." }, { status: 400 });

  const isFree = bool(fd, "isFree");
  const priceCents = isFree ? 0 : Math.max(0, Math.round(num(fd, "price") * 100));
  const slug = await uniqueSlug(str(fd, "slug") || title);

  let coverFile: string | undefined;
  let bookFile: string | undefined;
  let fileSize: number | undefined;
  let guideFile: string | undefined;
  let guideSize: number | undefined;

  try {
    const cover = file(fd, "cover");
    if (cover) coverFile = (await saveCoverFile(cover)).filename;
    const book = file(fd, "bookFile");
    if (book) {
      const saved = await saveBookFile(book);
      bookFile = saved.filename;
      fileSize = saved.size;
    }
    const guide = file(fd, "guide");
    if (guide) {
      const savedGuide = await saveBookFile(guide);
      guideFile = savedGuide.filename;
      guideSize = savedGuide.size;
    }
  } catch (e) {
    console.error("[admin/books] upload error:", e);
    return NextResponse.json({ error: "تعذّر رفع الملفات." }, { status: 500 });
  }

  const created = await prisma.book.create({
    data: {
      slug,
      title,
      subtitle: str(fd, "subtitle") || null,
      author: str(fd, "author") || "محمد المسقري",
      description,
      category: str(fd, "category") || null,
      pages: num(fd, "pages") || null,
      isFree,
      priceCents,
      currency: str(fd, "currency") || "USD",
      isPublished: bool(fd, "isPublished"),
      featured: bool(fd, "featured"),
      sortOrder: num(fd, "sortOrder"),
      seriesId: str(fd, "seriesId") || null,
      seriesOrder: num(fd, "seriesOrder"),
      chapters: str(fd, "chapters") || null,
      audience: str(fd, "audience") || null,
      takeaways: str(fd, "takeaways") || null,
      copyright: str(fd, "copyright") || null,
      coverFile,
      bookFile,
      fileSize,
      guideFile,
      guideSize,
      language: "ar",
    },
  });

  return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
}
