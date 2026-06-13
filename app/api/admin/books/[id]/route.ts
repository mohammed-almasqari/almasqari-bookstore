import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import {
  saveBookFile,
  saveCoverFile,
  deleteBookFile,
  deleteCoverFile,
} from "@/lib/storage";
import { fdStr, fdBool, fdNum, fdFile, fdHas } from "@/lib/formdata";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) return NextResponse.json({ error: "الكتاب غير موجود." }, { status: 404 });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const title = fdStr(fd, "title") || book.title;
  const isFree = fdHas(fd, "isFree") ? fdBool(fd, "isFree") : book.isFree;
  const priceCents = isFree
    ? 0
    : fdHas(fd, "price")
    ? Math.max(0, Math.round(fdNum(fd, "price") * 100))
    : book.priceCents;

  // معرّف الرابط: أعد توليده إذا غيّر المستخدمه يدويًا
  let slug = book.slug;
  const requestedSlug = fdStr(fd, "slug");
  if (requestedSlug && requestedSlug !== book.slug) {
    slug = await uniqueSlug(requestedSlug, book.id);
  }

  const data: any = {
    title,
    slug,
    subtitle: fdHas(fd, "subtitle") ? fdStr(fd, "subtitle") || null : book.subtitle,
    author: fdStr(fd, "author") || book.author,
    description: fdStr(fd, "description") || book.description,
    category: fdHas(fd, "category") ? fdStr(fd, "category") || null : book.category,
    pages: fdHas(fd, "pages") ? fdNum(fd, "pages") || null : book.pages,
    isFree,
    priceCents,
    currency: fdStr(fd, "currency") || book.currency,
    isPublished: fdHas(fd, "isPublished") ? fdBool(fd, "isPublished") : book.isPublished,
    featured: fdHas(fd, "featured") ? fdBool(fd, "featured") : book.featured,
    sortOrder: fdHas(fd, "sortOrder") ? fdNum(fd, "sortOrder") : book.sortOrder,
    seriesId: fdHas(fd, "seriesId") ? (fdStr(fd, "seriesId") || null) : book.seriesId,
    seriesOrder: fdHas(fd, "seriesOrder") ? fdNum(fd, "seriesOrder") : book.seriesOrder,
    chapters: fdHas(fd, "chapters") ? (fdStr(fd, "chapters") || null) : book.chapters,
    audience: fdHas(fd, "audience") ? (fdStr(fd, "audience") || null) : book.audience,
    takeaways: fdHas(fd, "takeaways") ? (fdStr(fd, "takeaways") || null) : book.takeaways,
    copyright: fdHas(fd, "copyright") ? (fdStr(fd, "copyright") || null) : book.copyright,
  };

  try {
    const cover = fdFile(fd, "cover");
    if (cover) {
      await deleteCoverFile(book.coverFile);
      data.coverFile = (await saveCoverFile(cover)).filename;
    }
    const newBookFile = fdFile(fd, "bookFile");
    if (newBookFile) {
      await deleteBookFile(book.bookFile);
      const saved = await saveBookFile(newBookFile);
      data.bookFile = saved.filename;
      data.fileSize = saved.size;
    }
  } catch (e) {
    console.error("[admin/books PATCH] upload error:", e);
    return NextResponse.json({ error: "تعذّر رفع الملفات." }, { status: 500 });
  }

  const updated = await prisma.book.update({ where: { id: book.id }, data });
  return NextResponse.json({ ok: true, id: updated.id, slug: updated.slug });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) return NextResponse.json({ error: "الكتاب غير موجود." }, { status: 404 });

  await deleteBookFile(book.bookFile);
  await deleteCoverFile(book.coverFile);
  await prisma.book.delete({ where: { id: book.id } });

  return NextResponse.json({ ok: true });
}
