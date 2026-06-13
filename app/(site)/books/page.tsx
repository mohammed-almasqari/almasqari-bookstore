import Link from "next/link";
import { prisma } from "@/lib/db";
import BookCard, { type BookCardData } from "@/components/BookCard";
import TrustBadges from "@/components/TrustBadges";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "المكتبة",
  description: "تصفّح كل كتب محمد المسقري الرقمية — فلترة حسب التصنيف والسلسلة، بحث وترتيب.",
};

type Search = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function BooksPage({ searchParams }: { searchParams: Search }) {
  const filter = one(searchParams.filter) || "all";
  const category = one(searchParams.category);
  const seriesId = one(searchParams.series);
  const q = one(searchParams.q).trim();
  const sort = one(searchParams.sort) || "newest";

  const where: any = { isPublished: true };
  if (filter === "free") where.isFree = true;
  if (filter === "paid") where.isFree = false;
  if (category) where.category = category;
  if (seriesId) where.seriesId = seriesId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { subtitle: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    sort === "oldest" ? { createdAt: "asc" }
    : sort === "title" ? { title: "asc" }
    : sort === "price" ? { priceCents: "asc" }
    : { createdAt: "desc" };

  const [books, cats, series] = await Promise.all([
    prisma.book.findMany({ where, orderBy }) as Promise<BookCardData[]>,
    prisma.book.findMany({ where: { isPublished: true, category: { not: null } }, select: { category: true }, distinct: ["category"] }),
    prisma.series.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);
  const categories = cats.map((c) => c.category).filter(Boolean) as string[];

  const tabs = [
    { key: "all", label: "الكل" },
    { key: "paid", label: "مدفوعة" },
    { key: "free", label: "مجانية" },
  ];

  return (
    <div className="container-x py-12">
      <div className="text-center">
        <h1 className="section-title">المكتبة</h1>
        <p className="mt-3 text-ink-muted">ابحث وفلتر للوصول إلى كتابك بسرعة.</p>
      </div>

      {/* أدوات الفلترة */}
      <form className="card mt-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input name="q" defaultValue={q} className="input lg:col-span-2" placeholder="ابحث بالعنوان أو الوصف…" />
        <select name="filter" defaultValue={filter} className="input">
          {tabs.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select name="category" defaultValue={category} className="input">
          <option value="">كل التصنيفات</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="series" defaultValue={seriesId} className="input">
          <option value="">كل السلاسل</option>
          {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <select name="sort" defaultValue={sort} className="input max-w-[200px]">
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="title">أبجدي</option>
            <option value="price">السعر</option>
          </select>
          <button type="submit" className="btn-primary">تطبيق الفلترة</button>
          <Link href="/books" className="btn-ghost">إعادة ضبط</Link>
        </div>
      </form>

      {/* النتائج */}
      <p className="mt-6 text-sm text-ink-muted">{books.length} كتاب</p>
      {books.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      ) : (
        <div className="card mx-auto mt-6 max-w-md p-12 text-center text-ink-muted">لا توجد نتائج مطابقة. جرّب فلترة أخرى.</div>
      )}

      <TrustBadges className="mt-16" />
    </div>
  );
}
