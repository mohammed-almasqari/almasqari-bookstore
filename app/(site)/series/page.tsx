import Link from "next/link";
import { prisma } from "@/lib/db";
import BookCover from "@/components/BookCover";
import { BookIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "السلاسل",
  description: "سلاسل كتب محمد المسقري — اقرأها بالترتيب الموصى به لرحلة معرفية متكاملة.",
};

export default async function SeriesListPage() {
  const series = await prisma.series.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      books: {
        where: { isPublished: true },
        orderBy: { seriesOrder: "asc" },
        select: { id: true, title: true, coverFile: true },
      },
    },
  });

  return (
    <div className="container-x py-12">
      <div className="text-center">
        <h1 className="section-title">السلاسل</h1>
        <p className="mt-3 text-ink-muted">رحلات معرفية متكاملة — كل سلسلة تأخذك خطوة بخطوة.</p>
      </div>

      {series.length === 0 ? (
        <div className="card mx-auto mt-10 max-w-md p-12 text-center text-ink-muted">لا توجد سلاسل منشورة بعد.</div>
      ) : (
        <div className="mt-10 space-y-6">
          {series.map((s) => (
            <Link key={s.id} href={`/series/${s.slug}`} className="card card-hover block overflow-hidden p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="badge bg-steel/10 text-steel"><BookIcon className="h-3.5 w-3.5" /> {s.books.length} كتب</span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">{s.title}</h2>
                  {s.description && <p className="mt-2 max-w-2xl leading-8 text-ink-muted line-clamp-2">{s.description}</p>}
                  <span className="mt-3 inline-block text-sm font-bold text-shield">استعرض السلسلة ←</span>
                </div>
                <div className="flex -space-x-3 space-x-reverse">
                  {s.books.slice(0, 4).map((b) => (
                    <div key={b.id} className="h-24 w-16 overflow-hidden rounded-lg border-2 border-white shadow-card">
                      <BookCover bookId={b.id} title={b.title} hasCover={!!b.coverFile} />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
