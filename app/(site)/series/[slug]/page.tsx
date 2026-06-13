import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import BookCard, { type BookCardData } from "@/components/BookCard";
import PurchasePanel from "@/components/PurchasePanel";
import { formatPrice, priceToDecimalString } from "@/lib/format";
import { BookIcon, LayersIcon, CheckIcon } from "@/components/icons";

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

  const settings = await getSettings();
  const paidBooks = series.books.filter((b) => !b.isFree);
  const regularTotal = paidBooks.reduce((s, b) => s + b.priceCents, 0);
  const bundleCents = series.bundlePriceCents;
  const currency = paidBooks[0]?.currency || "USD";
  const savings = regularTotal - bundleCents;
  // عرض الحزمة فقط حين يُضبط سعر حزمة صالح ويوفّر فعلًا عن الشراء المنفصل
  const showBundle =
    bundleCents > 0 && series.books.length >= 2 && (regularTotal === 0 || bundleCents < regularTotal);

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
      <div className="card overflow-hidden bg-gradient-to-br from-night to-night-soft p-8 text-white md:p-12">
        <span className="badge bg-white/15 text-shield-light"><BookIcon className="h-4 w-4" /> {series.books.length} كتب في السلسلة</span>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">{series.title}</h1>
        {series.description && <p className="mt-4 max-w-2xl leading-9 text-white/80">{series.description}</p>}
      </div>

      {/* عرض الحزمة: السلسلة كاملة بسعر مخفّض */}
      {showBundle && (
        <div className="mt-8 grid gap-8 rounded-3xl border border-shield/30 bg-shield/5 p-6 shadow-card sm:p-8 lg:grid-cols-[1fr_360px]">
          <div>
            <span className="badge bg-shield/15 text-guard"><LayersIcon className="h-4 w-4" /> عرض الحزمة</span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">احصل على السلسلة كاملة</h2>
            <p className="mt-2 leading-8 text-ink-soft">
              اقتنِ كتب سلسلة «{series.title}» الـ{series.books.length} دفعةً واحدة، تصلك جميعًا بروابط تحميل آمنة فور إتمام الدفع.
            </p>
            <ul className="mt-4 space-y-2">
              {series.books.map((b) => (
                <li key={b.id} className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                  <CheckIcon className="h-4 w-4 text-safe" /> {b.title}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold text-guard tnum">{formatPrice(bundleCents, currency)}</span>
              {regularTotal > bundleCents && (
                <>
                  <span className="text-lg text-ink-muted line-through tnum">{formatPrice(regularTotal, currency)}</span>
                  {savings > 0 && <span className="badge bg-safe/10 text-safe">وفّر {formatPrice(savings, currency)}</span>}
                </>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-sand-200 bg-surface p-5 shadow-card">
            <PurchasePanel
              seriesId={series.id}
              title={`حزمة «${series.title}»`}
              amount={priceToDecimalString(bundleCents)}
              currency={currency}
              priceLabel={formatPrice(bundleCents, currency)}
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
          </div>
        </div>
      )}

      {/* الكتب بترتيب القراءة */}
      <h2 className="section-title mt-12 text-2xl">اقرأها بالترتيب</h2>
      {series.books.length === 0 ? (
        <p className="mt-6 text-ink-muted">لا توجد كتب في هذه السلسلة بعد.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
