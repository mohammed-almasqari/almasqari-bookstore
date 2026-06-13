import Link from "next/link";
import BookCover from "./BookCover";
import WishlistButton from "./WishlistButton";
import { formatPrice } from "@/lib/format";
import { DownloadIcon, GiftIcon } from "./icons";

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
  return (
    <div className="group relative">
      <div className="absolute left-3 top-3 z-10">
        <WishlistButton bookId={book.id} />
      </div>
      <Link
        href={book.isFree ? "/free" : `/books/${book.slug}`}
        className="card card-hover flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
            <BookCover bookId={book.id} title={book.title} hasCover={!!book.coverFile} />
          </div>
          <div className="absolute right-3 top-3">
            {book.isFree ? (
              <span className="badge-free shadow-sm backdrop-blur">
                <GiftIcon className="h-3.5 w-3.5" /> مجاني
              </span>
            ) : (
              <span className="badge bg-white/90 text-guard shadow-sm backdrop-blur">
                {book.category || "كتاب"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-extrabold leading-snug text-ink line-clamp-2">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="mt-1.5 text-sm leading-7 text-ink-muted line-clamp-2">{book.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          {book.isFree ? (
            <span className="font-display text-lg font-extrabold text-safe">مجاني</span>
          ) : (
            <span className="tnum font-display text-lg font-extrabold text-guard">
              {formatPrice(book.priceCents, book.currency)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-shield">
            {book.isFree ? <GiftIcon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
            {book.isFree ? "احصل عليه" : "التفاصيل"}
          </span>
        </div>
      </div>
    </Link>
    </div>
  );
}
