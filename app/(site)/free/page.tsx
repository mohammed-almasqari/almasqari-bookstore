import { prisma } from "@/lib/db";
import BookCover from "@/components/BookCover";
import FreeClaimForm from "@/components/FreeClaimForm";
import { CheckIcon, GiftIcon, MailIcon, LockIcon, DownloadIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "كتب مجانية",
  description: "سجّل اسمك وبريدك واحصل على كتب محمد المسقري المجانية مباشرة إلى بريدك.",
};

export default async function FreePage() {
  const books = await prisma.book.findMany({
    where: { isPublished: true, isFree: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });

  const hero = books[0];

  return (
    <div className="py-12">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-free mx-auto"><GiftIcon className="h-4 w-4" /> مجاني بالكامل</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            كتب مجانية تصلك <span className="text-safe">إلى بريدك</span>
          </h1>
          <p className="mt-4 text-lg leading-9 text-ink-soft">
            سجّل اسمك وبريدك الإلكتروني، أكّد بريدك بضغطة واحدة، وسيصلك رابط تحميل آمن فورًا.
          </p>
        </div>

        {books.length === 0 ? (
          <div className="card mx-auto mt-10 max-w-md p-12 text-center text-ink-muted">
            لا توجد كتب مجانية متاحة حاليًا. تابعنا قريبًا.
          </div>
        ) : (
          <div className="mx-auto mt-12 grid max-w-5xl items-start gap-10 lg:grid-cols-2">
            {/* عرض الكتاب */}
            <div className="order-2 lg:order-1">
              {hero && (
                <div className="card overflow-hidden">
                  <div className="flex gap-5 p-6">
                    <div className="w-28 shrink-0">
                      <div className="aspect-[3/4] overflow-hidden rounded-xl border border-sand-200 shadow-card">
                        <BookCover bookId={hero.id} title={hero.title} hasCover={!!hero.coverFile} />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-extrabold text-ink">{hero.title}</h2>
                      {hero.subtitle && <p className="mt-1 text-sm text-ink-soft">{hero.subtitle}</p>}
                      <p className="mt-3 text-sm leading-7 text-ink-muted line-clamp-4">{hero.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="card mt-6 p-6">
                <h3 className="font-display text-lg font-extrabold text-ink">كيف تستلم كتابك؟</h3>
                <ol className="mt-4 space-y-4">
                  {[
                    { icon: <GiftIcon className="h-5 w-5" />, t: "سجّل بياناتك", d: "اسمك وبريدك فقط." },
                    { icon: <MailIcon className="h-5 w-5" />, t: "أكّد بريدك", d: "افتح رسالة التأكيد واضغط الزر." },
                    { icon: <DownloadIcon className="h-5 w-5" />, t: "حمّل الكتاب", d: "يصلك رابط تحميل آمن فورًا." },
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-safe/10 text-safe">
                        {s.icon}
                      </span>
                      <div>
                        <div className="font-bold text-ink">{s.t}</div>
                        <div className="text-sm text-ink-muted">{s.d}</div>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand-100 pt-4 text-xs font-bold text-ink-muted">
                  <span className="inline-flex items-center gap-1.5"><LockIcon className="h-3.5 w-3.5 text-safe" /> رابط مشفّر</span>
                  <span className="inline-flex items-center gap-1.5"><CheckIcon className="h-3.5 w-3.5 text-safe" /> بدون بطاقة</span>
                </div>
              </div>
            </div>

            {/* النموذج */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="card border-safe/20 p-7 shadow-card-hover sm:p-9">
                <h2 className="font-display text-2xl font-extrabold text-ink">احصل على نسختك المجانية</h2>
                <p className="mt-2 text-sm text-ink-muted">ادخل بياناتك أدناه وسنرسل الكتاب إلى بريدك.</p>
                <div className="mt-6">
                  <FreeClaimForm books={books.map((b) => ({ id: b.id, title: b.title }))} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
