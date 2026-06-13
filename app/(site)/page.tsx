import Link from "next/link";
import { prisma } from "@/lib/db";
import BookCard, { type BookCardData } from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import {
  ShieldIcon,
  DownloadIcon,
  MailIcon,
  GiftIcon,
  LockIcon,
  CheckIcon,
  StarIcon,
  BookIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

async function getData() {
  const [featured, allBooks, series] = await Promise.all([
    prisma.book.findFirst({
      where: { isPublished: true, isFree: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { orders: true, freeClaims: true } } },
    }),
    prisma.series.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 3,
      include: { books: { where: { isPublished: true }, orderBy: { seriesOrder: "asc" }, select: { id: true, title: true, coverFile: true } } },
    }),
  ]);

  const books = allBooks.slice(0, 12) as unknown as BookCardData[];
  const popular = [...allBooks]
    .map((b) => ({ b, score: b._count.orders + b._count.freeClaims }))
    .filter((x) => x.score > 0)
    .sort((a, c) => c.score - a.score)
    .slice(0, 4)
    .map((x) => x.b as unknown as BookCardData);

  return { featured, books, series, popular };
}

export default async function HomePage() {
  const { featured, books, series, popular } = await getData();

  return (
    <>
      {/* البطل */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <span className="badge bg-shield/10 text-guard">
              <ShieldIcon className="h-4 w-4" /> مكتبة الكاتب محمد المسقري
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.15] text-ink sm:text-5xl">
              معرفة <span className="text-shield">تحميك</span>،
              <br /> وكتب تصلك في لحظة
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-9 text-ink-soft">
              كتب رقمية متخصصة في الأمن الرقمي والحماية من الاحتيال والابتزاز. اشترِ وحمّل
              فورًا، أو احصل على نسختك المجانية عبر بريدك الإلكتروني.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/books" className="btn-dark">تصفّح المكتبة</Link>
              <Link href="/free" className="btn-primary">
                <GiftIcon className="h-5 w-5" /> احصل على كتاب مجاني
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-ink-muted">
              <span className="inline-flex items-center gap-2"><LockIcon className="h-4 w-4 text-safe" /> دفع آمن</span>
              <span className="inline-flex items-center gap-2"><DownloadIcon className="h-4 w-4 text-steel" /> تحميل فوري</span>
              <span className="inline-flex items-center gap-2"><MailIcon className="h-4 w-4 text-shield" /> تسليم بالبريد</span>
            </div>
          </div>

          {/* غلاف الكتاب المميّز */}
          <div className="relative mx-auto w-full max-w-sm animate-fade-up">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-shield/20 via-transparent to-steel/20 blur-2xl" />
            {featured ? (
              <Link href="/free" className="block">
                <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl border border-sand-200 shadow-card-hover transition-transform hover:-translate-y-1.5">
                  <BookCover bookId={featured.id} title={featured.title} hasCover={!!featured.coverFile} />
                </div>
              </Link>
            ) : (
              <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl border border-sand-200 shadow-card-hover">
                <BookCover bookId="none" title="مكتبتك الرقمية" hasCover={false} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* الكتاب المجاني المميّز */}
      {featured && (
        <section className="container-x">
          <div className="card relative overflow-hidden p-8 md:p-12">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-safe md:w-2" />
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <span className="badge-free"><GiftIcon className="h-4 w-4" /> هديتنا لك</span>
                <h2 className="mt-4 font-display text-3xl font-extrabold text-ink">{featured.title}</h2>
                {featured.subtitle && (
                  <p className="mt-2 text-lg text-ink-soft">{featured.subtitle}</p>
                )}
                <p className="mt-4 max-w-2xl leading-9 text-ink-muted line-clamp-3">{featured.description}</p>
                <Link href="/free" className="btn-safe mt-6">
                  <GiftIcon className="h-5 w-5" /> سجّل واستلمه بالبريد مجانًا
                </Link>
              </div>
              <Link href="/free" className="hidden w-44 shrink-0 md:block">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-sand-200 shadow-card">
                  <BookCover bookId={featured.id} title={featured.title} hasCover={!!featured.coverFile} />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* المكتبة */}
      <section className="container-x mt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">المكتبة</h2>
            <p className="mt-2 text-ink-muted">اختر كتابك، ادفع بأمان، وحمّله في الحال.</p>
          </div>
          <Link href="/books" className="hidden text-sm font-bold text-shield hover:underline sm:block">
            عرض الكل ←
          </Link>
        </div>
        {books.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        ) : (
          <div className="card mt-8 p-12 text-center text-ink-muted">
            لا توجد كتب منشورة بعد. أضف كتبك من لوحة التحكم.
          </div>
        )}
      </section>

      {/* السلاسل */}
      {series.length > 0 && (
        <section className="container-x mt-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">السلاسل</h2>
              <p className="mt-2 text-ink-muted">رحلات معرفية متكاملة — اقرأها بالترتيب.</p>
            </div>
            <Link href="/series" className="hidden text-sm font-bold text-shield hover:underline sm:block">كل السلاسل ←</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {series.map((s) => (
              <Link key={s.id} href={`/series/${s.slug}`} className="card card-hover flex items-center gap-4 p-5">
                <div className="flex -space-x-3 space-x-reverse">
                  {s.books.slice(0, 3).map((b) => (
                    <div key={b.id} className="h-20 w-14 overflow-hidden rounded-lg border-2 border-white shadow-card">
                      <BookCover bookId={b.id} title={b.title} hasCover={!!b.coverFile} />
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <span className="badge bg-steel/10 text-steel"><BookIcon className="h-3.5 w-3.5" /> {s.books.length} كتب</span>
                  <h3 className="mt-2 font-display text-lg font-extrabold text-ink line-clamp-1">{s.title}</h3>
                  <span className="text-sm font-bold text-shield">استعرض ←</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* الأكثر تحميلًا */}
      {popular.length > 0 && (
        <section className="container-x mt-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">الأكثر تحميلًا</h2>
              <p className="mt-2 text-ink-muted">أكثر ما اختاره القرّاء.</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      {/* كيف يعمل المتجر */}
      <section className="container-x mt-24">
        <h2 className="section-title text-center">كيف تحصل على كتابك؟</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: <StarIcon className="h-7 w-7" />, t: "اختر كتابك", d: "تصفّح المكتبة واختر الكتاب الذي يناسبك، مجاني أو مدفوع." },
            { icon: <LockIcon className="h-7 w-7" />, t: "ادفع أو سجّل", d: "ادفع بأمان عبر PayPal، أو سجّل اسمك وبريدك للكتب المجانية." },
            { icon: <DownloadIcon className="h-7 w-7" />, t: "حمّل فورًا", d: "يصلك رابط تحميل آمن في بريدك مباشرة بعد التأكيد." },
          ].map((s, i) => (
            <div key={i} className="card card-hover relative p-7 text-center">
              <span className="absolute right-5 top-5 font-display text-5xl font-extrabold text-sand-200">
                {i + 1}
              </span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-shield/10 text-shield">
                {s.icon}
              </span>
              <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{s.t}</h3>
              <p className="mt-2 leading-8 text-ink-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* عن المؤلف */}
      <section id="about" className="container-x mt-24 scroll-mt-24">
        <div className="card overflow-hidden md:grid md:grid-cols-[auto_1fr]">
          <div className="grid place-items-center bg-gradient-to-br from-ink to-ink-soft p-10 text-white md:w-72">
            <div className="text-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-shield/20 font-display text-4xl font-extrabold text-shield-light">
                م
              </div>
              <div className="mt-4 font-display text-xl font-extrabold">محمد المسقري</div>
              <div className="mt-1 text-sm text-white/70">كاتب ومتخصص في الوعي الرقمي</div>
            </div>
          </div>
          <div className="p-8 md:p-12">
            <h2 className="font-display text-2xl font-extrabold text-ink">عن المؤلف</h2>
            <p className="mt-4 leading-9 text-ink-soft">
              محمد المسقري كاتب يهتم بتبسيط مفاهيم الأمن الرقمي للقارئ العربي، ويسعى عبر كتبه إلى
              حماية الأفراد والعائلات من الاحتيال والابتزاز الإلكتروني بأسلوب عملي قريب من الواقع.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["محتوى عربي أصيل وعملي", "قصص واقعية ودروس مستخلصة", "خطوات حماية قابلة للتطبيق", "تحديث مستمر للمحتوى"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-ink-soft">
                    <CheckIcon className="h-5 w-5 shrink-0 text-safe" /> {f}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
