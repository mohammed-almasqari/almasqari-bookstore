import { prisma } from "@/lib/db";
import SeriesManager, { type SeriesRow } from "@/components/admin/SeriesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "السلاسل" };

export default async function AdminSeriesPage() {
  const series = await prisma.series.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { books: true } } },
  });
  const rows: SeriesRow[] = series.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description,
    sortOrder: s.sortOrder,
    isPublished: s.isPublished,
    bundlePriceCents: s.bundlePriceCents,
    bookCount: s._count.books,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">السلاسل</h1>
        <p className="mt-1 text-sm text-ink-muted">أنشئ سلاسل واربط بها الكتب من صفحة تعديل الكتاب.</p>
      </div>
      <SeriesManager initial={rows} />
    </div>
  );
}
