import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import BookCover from "@/components/BookCover";
import DeleteBookButton from "@/components/admin/DeleteBookButton";
import { PlusIcon, EditIcon, GiftIcon, CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة الكتب" };

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { orders: true, freeClaims: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">الكتب</h1>
          <p className="mt-1 text-sm text-ink-muted">{books.length} كتاب في المكتبة.</p>
        </div>
        <Link href="/admin/books/new" className="btn-primary h-11 px-5 text-sm">
          <PlusIcon className="h-5 w-5" /> إضافة كتاب
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-white p-12 text-center">
          <p className="text-ink-muted">لا توجد كتب بعد. ابدأ بإضافة كتابك الأول.</p>
          <Link href="/admin/books/new" className="btn-primary mt-4 inline-flex">
            <PlusIcon className="h-5 w-5" /> إضافة كتاب
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
          <ul className="divide-y divide-sand-100">
            {books.map((b) => (
              <li key={b.id} className="flex items-center gap-4 p-4">
                <div className="shrink-0 overflow-hidden rounded-lg border border-sand-200" style={{ width: 60, height: 80 }}>
                  <BookCover bookId={b.id} title={b.title} hasCover={!!b.coverFile} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-ink">{b.title}</h3>
                    {b.isFree ? (
                      <span className="badge-free"><GiftIcon className="h-3 w-3" /> مجاني</span>
                    ) : (
                      <span className="badge-paid tnum">{formatPrice(b.priceCents, b.currency)}</span>
                    )}
                    {b.isPublished ? (
                      <span className="badge bg-safe/10 text-safe"><CheckIcon className="h-3 w-3" /> منشور</span>
                    ) : (
                      <span className="badge bg-ink/10 text-ink-muted">مسودة</span>
                    )}
                    {b.featured && <span className="badge bg-shield/10 text-shield">مميّز</span>}
                  </div>
                  <p className="mt-1 truncate text-sm text-ink-muted">{b.subtitle || b.category || "—"}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {b._count.orders} عملية شراء · {b._count.freeClaims} تسجيل مجاني
                    {!b.bookFile && <span className="text-amber-600"> · لا يوجد ملف مرفوع</span>}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/books/${b.id}`}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted transition-colors hover:border-shield hover:bg-shield/5 hover:text-shield"
                    title="تعديل"
                  >
                    <EditIcon className="h-4 w-4" />
                  </Link>
                  <DeleteBookButton id={b.id} title={b.title} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
