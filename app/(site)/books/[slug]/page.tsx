import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import BookCover from "@/components/BookCover";
import BookCard, { type BookCardData } from "@/components/BookCard";
import PurchasePanel from "@/components/PurchasePanel";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ShareButtons from "@/components/ShareButtons";
import { formatPrice, priceToDecimalString, formatBytes, formatDate } from "@/lib/format";
import { BookIcon, CheckIcon, DownloadIcon, GiftIcon, LockIcon } from "@/components/icons";

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
  const chapterList = (book.chapters || "")
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);

  const reviews = await prisma.review.findMany({
    where: { bookId: book.id, approved: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;

  const base = env.siteUrl.replace(/\/$/, "");
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

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        {/* الغلاف */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative mx-auto w-full max-w-xs">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-shield/20 to-steel/20 blur-2xl" />
            <div className="aspect-[3/4] overflow-hidden rounded-3xl border border-sand-200 shadow-card-hover">
              <BookCover bookId={book.id} title={book.title} hasCover={!!book.coverFile} />
            </div>
          </div>
        </div>

        {/* التفاصيل */}
        <div>
          {book.isFree ? <span className="badge-free"><GiftIcon className="h-4 w-4" /> كتاب مجاني</span> : <span className="badge-paid"><BookIcon className="h-4 w-4" /> {book.category || "كتاب رقمي"}</span>}
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            {book.title}
          </h1>
          {book.subtitle && <p className="mt-3 text-xl text-ink-soft">{book.subtitle}</p>}

          {reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={avgRating} size="md" />
              <span className="text-sm font-bold text-ink-soft tnum">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-ink-muted">({reviewCount} تقييم)</span>
            </div>
          )}

          <div className="mt-6 max-w-2xl whitespace-pre-line leading-9 text-ink-soft">
            {book.description}
          </div>

          {chapterList.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-extrabold text-ink">فهرس الفصول</h2>
              <ol className="mt-3 space-y-2">
                {chapterList.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-sand-200 bg-surface px-4 py-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-shield/10 text-xs font-bold text-guard tnum">{i + 1}</span>
                    <span className="text-ink-soft">{c}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* بطاقة الحقائق */}
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-1 rounded-2xl border border-sand-200 bg-surface p-6 sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-sand-100 py-2.5 sm:block sm:border-0">
                <dt className="text-sm text-ink-muted">{k}</dt>
                <dd className="font-bold text-ink sm:mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          {/* صندوق الشراء */}
          <div className="mt-8 rounded-3xl border border-sand-200 bg-surface p-6 shadow-card sm:p-8">
            {book.isFree ? (
              <div className="text-center">
                <div className="font-display text-3xl font-extrabold text-safe">مجاني تمامًا</div>
                <p className="mt-2 text-ink-muted">سجّل اسمك وبريدك واستلم الكتاب فورًا.</p>
                <Link href="/free" className="btn-safe mt-5 w-full">
                  <GiftIcon className="h-5 w-5" /> احصل عليه مجانًا
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="font-display text-lg font-bold text-ink">احصل على نسختك</span>
                  <span className="tnum font-display text-3xl font-extrabold text-guard">
                    {formatPrice(book.priceCents, book.currency)}
                  </span>
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
          </div>

          {/* مزايا */}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-soft">
            <li className="inline-flex items-center gap-2"><DownloadIcon className="h-4 w-4 text-steel" /> تحميل فوري</li>
            <li className="inline-flex items-center gap-2"><LockIcon className="h-4 w-4 text-safe" /> رابط آمن ومؤقت</li>
            <li className="inline-flex items-center gap-2"><CheckIcon className="h-4 w-4 text-shield" /> نسخة أصلية بصيغة PDF</li>
          </ul>

          {/* مشاركة */}
          <div className="mt-6 border-t border-sand-100 pt-5">
            <ShareButtons url={`${base}/books/${book.slug}`} title={book.title} />
          </div>
        </div>
      </div>

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
    </div>
  );
}
