import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import BookCard, { type BookCardData } from "@/components/BookCard";
import { BookIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getSeries(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      books: { where: { isPublished: true }, orderBy: { seriesOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = await getSeries(params.slug);
  if (!s) return { title: "سلسلة غير موجودة" };
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    title: `${s.title} — سلسلة كاملة`,
    description: (s.description || `سلسلة ${s.title} للكاتب محمد المسقري`).slice(0, 155),
    alternates: { canonical: `${base}/series/${s.slug}` },
  };
}

export default async function SeriesPage({ params }: { params: { slug: string } }) {
  const series = await getSeries(params.slug);
  if (!series || !series.isPublished) notFound();

  return (
    <div className="container-x py-10">
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-shield">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/series" className="hover:text-shield">السلاسل</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{series.title}</span>
      </nav>

      {/* بطل السلسلة */}
      <div className="card overflow-hidden bg-gradient-to-br from-ink to-ink-soft p-8 text-white md:p-12">
        <span className="badge bg-white/15 text-shield-light"><BookIcon className="h-4 w-4" /> {series.books.length} كتب في السلسلة</span>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">{series.title}</h1>
        {series.description && <p className="mt-4 max-w-2xl leading-9 text-white/80">{series.description}</p>}
      </div>

      {/* الكتب بترتيب القراءة */}
      <h2 className="section-title mt-12 text-2xl">اقرأها بالترتيب</h2>
      {series.books.length === 0 ? (
        <p className="mt-6 text-ink-muted">لا توجد كتب في هذه السلسلة بعد.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {series.books.map((b, i) => (
            <div key={b.id} className="relative">
              <span className="absolute -right-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-shield font-display text-sm font-extrabold text-white shadow-glow tnum">
                {i + 1}
              </span>
              <BookCard book={b as BookCardData} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
