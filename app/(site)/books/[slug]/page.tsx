import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import BookCover from "@/components/BookCover";
import BuyButton from "@/components/BuyButton";
import { formatPrice, priceToDecimalString, formatBytes } from "@/lib/format";
import { BookIcon, CheckIcon, DownloadIcon, GiftIcon, LockIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getBook(slug: string) {
  return prisma.book.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) return { title: "كتاب غير موجود" };
  return { title: book.title, description: book.subtitle || book.description.slice(0, 150) };
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book || !book.isPublished) notFound();

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
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-shield">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/books" className="hover:text-shield">المكتبة</Link>
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

          <div className="mt-6 max-w-2xl whitespace-pre-line leading-9 text-ink-soft">
            {book.description}
          </div>

          {/* بطاقة الحقائق */}
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-1 rounded-2xl border border-sand-200 bg-white p-6 sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-sand-100 py-2.5 sm:block sm:border-0">
                <dt className="text-sm text-ink-muted">{k}</dt>
                <dd className="font-bold text-ink sm:mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>

          {/* صندوق الشراء */}
          <div className="mt-8 rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
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
                <BuyButton
                  bookId={book.id}
                  title={book.title}
                  amount={priceToDecimalString(book.priceCents)}
                  currency={book.currency}
                  clientId={env.paypal.clientId}
                  priceLabel={formatPrice(book.priceCents, book.currency)}
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
        </div>
      </div>
    </div>
  );
}
