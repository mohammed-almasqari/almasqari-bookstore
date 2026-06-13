import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BookForm from "@/components/admin/BookForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعديل كتاب" };

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const [book, series] = await Promise.all([
    prisma.book.findUnique({ where: { id: params.id } }),
    prisma.series.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, title: true } }),
  ]);
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/books" className="text-sm font-bold text-shield hover:underline">← العودة للكتب</Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">تعديل: {book.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">حدّث بيانات الكتاب أو استبدل الملفات.</p>
      </div>
      <BookForm
        mode="edit"
        seriesList={series}
        initial={{
          id: book.id,
          title: book.title,
          slug: book.slug,
          subtitle: book.subtitle,
          author: book.author,
          category: book.category,
          description: book.description,
          chapters: book.chapters,
          pages: book.pages,
          isFree: book.isFree,
          priceCents: book.priceCents,
          currency: book.currency,
          isPublished: book.isPublished,
          featured: book.featured,
          sortOrder: book.sortOrder,
          seriesId: book.seriesId,
          seriesOrder: book.seriesOrder,
          coverFile: book.coverFile,
          bookFile: book.bookFile,
        }}
      />
    </div>
  );
}
