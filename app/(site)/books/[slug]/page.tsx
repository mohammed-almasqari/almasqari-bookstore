import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import BookCover from "@/components/BookCover";
import BookCard, { type BookCardData } from "@/components/BookCard";
import PurchasePanel from "@/components/PurchasePanel";
import InstantClaimForm from "@/components/InstantClaimForm";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ShareButtons from "@/components/ShareButtons";
import { formatPrice, priceToDecimalString, formatBytes, formatDate } from "@/lib/format";
import { BookIcon, CheckIcon, DownloadIcon, GiftIcon, LockIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getBook(slug: string) {
  return prisma.book.findUnique({ where: { slug }, include: { series: true } });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) return { title: "كتاب غير موجود" };
  const desc = (book.subtitle || book.description).slice(0, 155);
  const base = env.siteUrl.replace(/\/$/, "");
  const images = book.coverFile ? [`${base}/api/cover/${book.id}`] : undefined;
  return {
    title: book.title,
    description: desc,
    alternates: { canonical: `${base}/books/${book.slug}` },
    openGraph: {
      title: `${book.title} — ${book.author}`,
      description: desc,
      type: "book",
      locale: "ar_AR",
      url: `${base}/books/${book.slug}`,
      ...(images ? { images } : {}),
    },
  };
}

function splitLines(s: string | null): string[] {
  return (s || "").split("\n").map((c) => c.trim()).filter(Boolean);
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book || !book.isPublished) notFound();

  const settings = await getSettings();

  const related = book.seriesId
    ? ((await prisma.book.findMany({
        where: { seriesId: book.seriesId, isPublished: true, id: { not: book.id } },
        orderBy: { seriesOrder: "asc" },
        take: 6,
      })) as BookCardData[])
    : [];

  const chapterList = splitLines(book.chapters);
  const audienceList = splitLines(book.audience);
  const takeawaysList = splitLines(book.takeaways);

  const reviews = await prisma.review.findMany({
    where: { bookId: book.id, approved: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;

  const base = env.siteUrl.replace(/\/$/, "");
  const year = new Date().getFullYear();
  const copyrightText =
    book.copyright?.trim() ||
    `جميع الحقوق محفوظة للمؤلف ${book.author} © ${year}. هذا الكتاب عملٌ فكريٌّ محميٌّ بموجب قوانين حقوق التأليف والنشر؛ يُمنع نسخه أو إعادة توزيعه أو بيعه أو اقتباس أجزاء منه دون إذنٍ خطّيٍّ مسبق من المؤلف. النسخة التي تحصل عليها مرخّصةٌ لاستخدامك الشخصي فقط، ورابط التحميل خاصٌّ بك فلا تشاركه.`;

  const bookLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    inLanguage: book.language,
    description: book.description.slice(0, 300),
    ...(book.coverFile ? { image: `${base}/api/cover/${book.id}` } : {}),
    ...(reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount } }
      : {}),
    offers: {
      "@type": "Offer",
      price: book.isFree ? "0" : (book.priceCents / 100).toFixed(2),
      priceCurrency: book.currency,
      availability: "https://schema.org/InStock",
      url: `${base}/books/${book.slug}`,
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: base },
      { "@type": "ListItem", position: 2, name: "المكتبة", item: `${base}/books` },
      { "@type": "ListItem", position: 3, name: book.title, item: `${base}/books/${book.slug}` },
    ],
  };

  const facts: [string, string][] = [
    ["المؤلف", book.author],
    ["التصنيف", book.category || "—"],
    ["عدد الصفحات", book.pages ? String(book.pages) : "—"],
    ["الصيغة", "PDF"],
    ["حجم الملف", formatBytes(book.fileSize)],
    ["اللغة", book.language === "ar" ? "العربية" : book.language],
  ];

  const ClaimBox = (
    <div id="claim" className="scroll-mt-24 rounded-3xl border border-sand-200 bg-surface p-6 shadow-card sm:p-7">
      {book.isFree ? (
        <>
          <div className="mb-4 text-center">
            <span className="badge-free mx-auto"><GiftIcon className="h-4 w-4" /> هدية مجانية</span>
            <div className="mt-2 font-display text-2xl font-extrabold text-safe">مجاني 100%</div>
            <p className="mt-1 text-sm text-ink-muted">سجّل اسمك وبريدك ويصلك الكتاب فورًا.</p>
          </div>
          <InstantClaimForm bookId={book.id} title={book.title} />
        </>
      ) : (
        <>
          <div className="mb-5 flex items-baseline justify-between">
            <span className="font-display text-lg font-bold text-ink">احصل على نسختك</span>
            <span className="tnum font-display text-3xl font-extrabold text-guard">{formatPrice(book.priceCents, book.currency)}</span>
          </div>
          <PurchasePanel
            bookId={book.id}
            title={book.title}
            amount={priceToDecimalString(book.priceCents)}
            currency={book.currency}
            priceLabel={formatPrice(book.priceCents, book.currency)}
            paypalEnabled={settings.paypalEnabled}
            paypalClientId={settings.paypalClientId}
            bankEnabled={settings.bankEnabled}
            bank={{
              name: settings.bankName,
              accountName: settings.bankAccountName,
              iban: settings.bankIban,
              accountNumber: settings.bankAccountNumber,
              swift: settings.bankSwift,
              instructions: settings.bankInstructions,
            }}
          />
        </>
      )}
      <ul className="mt-5 space-y-2 border-t border-sand-100 pt-4 text-sm font-bold text-ink-soft">
        <li className="flex items-center gap-2"><DownloadIcon className="h-4 w-4 text-steel" /> تحميل فوري بعد التسجيل</li>
        <li className="flex items-center gap-2"><LockIcon className="h-4 w-4 text-safe" /> رابط تحميل آمن ومؤقت</li>
        <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-shield" /> نسخة أصلية بصيغة PDF</li>
      </ul>
    </div>
  );

  return (
    <div className="container-x py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-shield">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/books" className="hover:text-shield">المكتبة</Link>
        {book.series && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/series/${book.series.slug}`} className="hover:text-shield">{book.series.title}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{book.title}</span>
      </nav>

      {/* البطل */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* العنوان والوصف */}
        <div className="order-2 lg:order-1">
          {book.isFree ? (
            <span className="badge-free"><GiftIcon className="h-4 w-4" /> كتاب مجاني</span>
          ) : (
            <span className="badge-paid"><BookIcon className="h-4 w-4" /> {book.category || "كتاب رقمي"}</span>
          )}
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">{book.title}</h1>
          {book.subtitle && <p className="mt-4 text-xl leading-9 text-ink-soft">{book.subtitle}</p>}

          {reviewCount > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <StarRating value={avgRating} size="md" />
              <span className="text-sm font-bold text-ink-soft tnum">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-ink-muted">({reviewCount} تقييم)</span>
            </div>
          )}

          {/* مزايا سريعة */}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-soft">
            <li className="inline-flex items-center gap-2"><DownloadIcon className="h-4 w-4 text-steel" /> تحميل فوري</li>
            <li className="inline-flex items-center gap-2"><LockIcon className="h-4 w-4 text-safe" /> رابط آمن ومؤقت</li>
            <li className="inline-flex items-center gap-2"><BookIcon className="h-4 w-4 text-shield" /> {book.pages ? `${book.pages} صفحة` : "PDF"}</li>
          </ul>

          {/* الغلاف للجوال */}
          <div className="mt-8 lg:hidden">
            <div className="relative mx-auto w-full max-w-[260px]">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-shield/20 to-steel/20 blur-2xl" />
              <div className="aspect-[3/4] overflow-hidden rounded-3xl border border-sand-200 shadow-card-hover">
                <BookCover bookId={book.id} title={book.title} hasCover={!!book.coverFile} />
              </div>
            </div>
          </div>

          {/* صندوق الطلب للجوال */}
          <div className="mt-8 lg:hidden">{ClaimBox}</div>

          {/* نبذة */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-extrabold text-ink">نبذة عن الكتاب</h2>
            <div className="mt-4 max-w-2xl whitespace-pre-line leading-9 text-ink-soft">{book.description}</div>
          </section>

          {/* بطاقة الحقائق */}
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-1 rounded-2xl border border-sand-200 bg-surface p-6 sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-sand-100 py-2.5 sm:block sm:border-0">
                <dt className="text-sm text-ink-muted">{k}</dt>
                <dd className="font-bold text-ink sm:mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* الغلاف + صندوق الطلب (سطح المكتب) */}
        <aside className="order-1 hidden lg:order-2 lg:block">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative mx-auto w-full max-w-[280px]">
              <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-shield/20 to-steel/20 blur-2xl" />
              <div className="aspect-[3/4] overflow-hidden rounded-3xl border border-sand-200 shadow-card-hover">
                <BookCover bookId={book.id} title={book.title} hasCover={!!book.coverFile} />
              </div>
            </div>
            <div className="mt-6">{ClaimBox}</div>
          </div>
        </aside>
      </div>

      {/* لمن هذا الكتاب */}
      {audienceList.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl">لمن هذا الكتاب؟</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {audienceList.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-surface p-4 shadow-card">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-safe/10 text-safe"><UsersIcon className="h-5 w-5" /></span>
                <span className="leading-7 text-ink-soft">{a}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* فهرس الفصول */}
      {chapterList.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl">فهرس الكتاب وفصوله</h2>
          <p className="mt-2 text-ink-muted">{chapterList.length} فصلًا تأخذك خطوة بخطوة.</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {chapterList.map((c, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-surface px-5 py-3.5 shadow-card">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-shield/10 text-sm font-extrabold text-guard tnum">{i + 1}</span>
                <span className="leading-7 text-ink-soft">{c}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* وصايا الكتاب */}
      {takeawaysList.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-2xl">وصايا الكتاب</h2>
          <p className="mt-2 text-ink-muted">خلاصات عملية تبقى معك بعد القراءة.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {takeawaysList.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-gradient-to-br from-shield/5 to-transparent p-5 shadow-card">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-shield text-white"><ShieldIcon className="h-5 w-5" /></span>
                <p className="leading-8 text-ink-soft">{t}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* شريط الهدية المجانية */}
      {book.isFree && (
        <section className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-night to-night-soft p-8 text-center text-white sm:p-12">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-shield-light">
            <GiftIcon className="h-4 w-4" /> هديتك في انتظارك
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">احصل على «{book.title}» مجانًا الآن</h2>
          <p className="mx-auto mt-3 max-w-xl leading-8 text-white/80">
            سجّل بريدك ويصلك الكتاب فورًا برابط تحميل آمن — هدية مجانية بالكامل من المؤلف محمد المسقري.
          </p>
          <a href="#claim" className="btn-safe mx-auto mt-6 w-full max-w-xs">
            <GiftIcon className="h-5 w-5" /> أرسل لي الكتاب مجانًا
          </a>
        </section>
      )}

      {/* كتب من نفس السلسلة */}
      {related.length > 0 && book.series && (
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="section-title text-2xl">من سلسلة «{book.series.title}»</h2>
            <Link href={`/series/${book.series.slug}`} className="text-sm font-bold text-shield hover:underline">السلسلة كاملة ←</Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}

      {/* آراء القرّاء */}
      <section className="mt-16">
        <div className="flex items-center gap-3">
          <h2 className="section-title text-2xl">آراء القرّاء</h2>
          {reviewCount > 0 && <StarRating value={avgRating} size="md" />}
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {reviewCount === 0 ? (
              <p className="rounded-2xl border border-dashed border-sand-200 bg-surface p-8 text-center text-ink-muted">
                لا توجد تقييمات بعد — كن أول من يقيّم هذا الكتاب.
              </p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-ink">{r.name}</span>
                      <StarRating value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-2 leading-8 text-ink-soft">{r.comment}</p>}
                    <p className="mt-1 text-xs text-ink-muted">{formatDate(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ReviewForm bookId={book.id} />
          </div>
        </div>
      </section>

      {/* مشاركة */}
      <section className="mt-12 border-t border-sand-100 pt-6">
        <ShareButtons url={`${base}/books/${book.slug}`} title={book.title} />
      </section>

      {/* حقوق الملكية الفكرية والنشر */}
      <section className="mt-12 rounded-2xl border border-sand-200 bg-sand-50 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <ShieldIcon className="h-5 w-5 text-guard" /> حقوق الملكية الفكرية والنشر
        </h2>
        <p className="mt-3 leading-8 text-ink-muted">{copyrightText}</p>
      </section>
    </div>
  );
}
