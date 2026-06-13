import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCustomerEmail } from "@/lib/customer-auth";
import AccountLoginForm from "@/components/AccountLoginForm";
import BookCover from "@/components/BookCover";
import { formatPrice, formatDate } from "@/lib/format";
import { DownloadIcon, GiftIcon, LogoutIcon, BookIcon, LockIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "مكتبتي" };

type Owned = {
  bookId: string;
  title: string;
  subtitle: string | null;
  coverFile: string | null;
  kind: "paid" | "free";
  date: Date;
  amountCents?: number;
  currency?: string;
};

async function getLibrary(email: string): Promise<Owned[]> {
  const [orders, claims] = await Promise.all([
    prisma.order.findMany({
      where: { customerEmail: email, status: "PAID" },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.freeClaim.findMany({
      where: { email, confirmed: true },
      include: { book: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const map = new Map<string, Owned>();
  for (const o of orders) {
    map.set(o.bookId, {
      bookId: o.bookId,
      title: o.book.title,
      subtitle: o.book.subtitle,
      coverFile: o.book.coverFile,
      kind: "paid",
      date: o.createdAt,
      amountCents: o.amountCents,
      currency: o.currency,
    });
  }
  for (const c of claims) {
    if (!map.has(c.bookId)) {
      map.set(c.bookId, {
        bookId: c.bookId,
        title: c.book.title,
        subtitle: c.book.subtitle,
        coverFile: c.book.coverFile,
        kind: "free",
        date: c.createdAt,
      });
    }
  }
  return Array.from(map.values());
}

export default async function AccountPage({ searchParams }: { searchParams: { error?: string } }) {
  const email = await getCustomerEmail();

  if (!email) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center py-14">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-shield/10 text-shield">
              <LockIcon className="h-9 w-9" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">الدخول إلى مكتبتي</h1>
            <p className="mt-1 text-sm text-ink-muted">أدخل بريدك وسنرسل لك رابط دخول آمن بدون كلمة مرور.</p>
          </div>
          {searchParams.error === "link" && (
            <div className="mb-4 rounded-xl border border-alert/30 bg-alert/5 p-3 text-center text-sm font-bold text-alert">
              رابط الدخول غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا.
            </div>
          )}
          <div className="card p-7">
            <AccountLoginForm />
          </div>
          <p className="mt-5 text-center text-sm text-ink-muted">
            لم تشترِ بعد؟ <Link href="/books" className="font-bold text-shield hover:underline">تصفّح المكتبة</Link>
          </p>
        </div>
      </div>
    );
  }

  const library = await getLibrary(email);

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">مكتبتي</h1>
          <p className="mt-1 text-ink-muted">
            مرحبًا، <span dir="ltr" className="font-bold text-ink-soft">{email}</span> — كتبك المتاحة للتحميل.
          </p>
        </div>
        <a href="/api/account/logout" className="btn-ghost h-11 px-5 text-sm">
          <LogoutIcon className="h-5 w-5" /> تسجيل الخروج
        </a>
      </div>

      {searchParams.error === "owns" && (
        <div className="mt-6 rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">
          هذا الكتاب غير مرتبط بحسابك.
        </div>
      )}

      {library.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-ink-muted">
            <BookIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 text-ink-muted">لا توجد كتب في مكتبتك بعد.</p>
          <Link href="/books" className="btn-primary mt-5 inline-flex">تصفّح المكتبة</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((b) => (
            <div key={b.bookId} className="card flex gap-4 p-5">
              <div className="w-20 shrink-0">
                <div className="aspect-[3/4] overflow-hidden rounded-lg border border-sand-200">
                  <BookCover bookId={b.bookId} title={b.title} hasCover={!!b.coverFile} />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  {b.kind === "free" ? (
                    <span className="badge-free"><GiftIcon className="h-3 w-3" /> مجاني</span>
                  ) : (
                    <span className="badge-paid tnum">{formatPrice(b.amountCents ?? 0, b.currency)}</span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-base font-extrabold leading-snug text-ink line-clamp-2">{b.title}</h3>
                <p className="mt-0.5 text-xs text-ink-muted">{formatDate(b.date)}</p>
                <a href={`/api/account/download/${b.bookId}`} className="btn-safe mt-auto h-10 px-4 text-sm">
                  <DownloadIcon className="h-4 w-4" /> تحميل
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
