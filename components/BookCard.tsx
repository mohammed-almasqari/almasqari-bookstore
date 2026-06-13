import Link from "next/link";
import BookCover from "./BookCover";
import WishlistButton from "./WishlistButton";
import { formatPrice } from "@/lib/format";
import { CartIcon, DownloadIcon } from "./icons";

export type BookCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  isFree: boolean;
  priceCents: number;
  currency: string;
  category: string | null;
  coverFile: string | null;
};

export default function BookCard({ book }: { book: BookCardData }) {
  const href = book.isFree ? "/free" : `/books/${book.slug}`;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-sand-200 bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
      {/* المفضلة */}
      <div className="absolute left-3 top-3 z-20">
        <WishlistButton bookId={book.id} />
      </div>

      {/* الغلاف (≈ 60% من ارتفاع البطاقة) */}
      <Link
        href={href}
        aria-label={book.title}
        className="relative block aspect-[16/11] overflow-hidden bg-gradient-to-br from-sand-100 to-sand-50"
      >
        <BookCover
          bookId={book.id}
          title={book.title}
          hasCover={!!book.coverFile}
          fit="contain"
          className="p-5 drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {/* الشارة */}
        <div className="absolute right-3 top-3">
          {book.isFree ? (
            <span className="inline-flex items-center rounded-full bg-safe px-3 py-1 text-xs font-extrabold text-white shadow-sm">
              مجاني
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-guard px-3 py-1 text-xs font-extrabold text-white shadow-sm">
              {book.category || "مدفوع"}
            </span>
          )}
        </div>
      </Link>

      {/* المحتوى */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={href} className="transition-colors hover:text-shield">
          <h3 className="font-display text-lg font-extrabold leading-snug text-ink line-clamp-2">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1.5 min-h-[2.5rem] text-sm leading-6 text-ink-muted line-clamp-2">
          {book.subtitle || (book.isFree ? "كتاب مجاني — حمّله فورًا بعد تأكيد بريدك." : "نسخة رقمية أصلية بصيغة PDF بتحميل فوري.")}
        </p>

        {/* السعر */}
        <div className="mt-3">
          {book.isFree ? (
            <span className="font-display text-xl font-extrabold text-safe">مجاني 100%</span>
          ) : (
            <span className="tnum font-display text-2xl font-extrabold text-guard">
              {formatPrice(book.priceCents, book.currency)}
            </span>
          )}
        </div>

        {/* زر الإجراء */}
        <Link
          href={href}
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
            book.isFree
              ? "bg-gradient-to-l from-safe-light to-safe hover:shadow-lg"
              : "bg-gradient-to-l from-shield to-guard hover:shadow-glow"
          }`}
        >
          {book.isFree ? <DownloadIcon className="h-5 w-5" /> : <CartIcon className="h-5 w-5" />}
          {book.isFree ? "احصل عليه مجانًا" : "اشترِ الآن"}
        </Link>
      </div>
    </div>
  );
}
