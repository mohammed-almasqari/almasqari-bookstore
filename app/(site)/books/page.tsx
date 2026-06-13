import Link from "next/link";
import { prisma } from "@/lib/db";
import BookCard, { type BookCardData } from "@/components/BookCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "المكتبة" };

type Search = { [key: string]: string | string[] | undefined };

export default async function BooksPage({ searchParams }: { searchParams: Search }) {
  const filter = (searchParams.filter as string) || "all";

  const where: any = { isPublished: true };
  if (filter === "free") where.isFree = true;
  if (filter === "paid") where.isFree = false;

  const books = (await prisma.book.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })) as BookCardData[];

  const tabs = [
    { key: "all", label: "كل الكتب" },
    { key: "paid", label: "مدفوعة" },
    { key: "free", label: "مجانية" },
  ];

  return (
    <div className="container-x py-12">
      <div className="text-center">
        <h1 className="section-title">المكتبة الكاملة</h1>
        <p className="mt-3 text-ink-muted">كل كتب محمد المسقري الرقمية في مكان واحد.</p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-2xl border border-sand-200 bg-white p-1.5 shadow-card">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key === "all" ? "/books" : `/books?filter=${t.key}`}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
                filter === t.key ? "bg-shield text-white shadow-glow" : "text-ink-soft hover:text-shield"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {books.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      ) : (
        <div className="card mx-auto mt-10 max-w-md p-12 text-center text-ink-muted">
          لا توجد كتب في هذا التصنيف بعد.
        </div>
      )}
    </div>
  );
}
