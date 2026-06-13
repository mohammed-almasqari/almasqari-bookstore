import { BookIcon } from "./icons";

type Props = {
  bookId: string;
  title: string;
  hasCover: boolean;
  className?: string;
  fit?: "cover" | "contain";
};

/**
 * يعرض غلاف الكتاب من المسار الآمن، أو غلافًا بديلًا أنيقًا إن لم يُرفع غلاف بعد.
 * fit="contain" يعرض الغلاف كاملًا (طافيًا) و"cover" يملأ المساحة.
 */
export default function BookCover({ bookId, title, hasCover, className = "", fit = "cover" }: Props) {
  if (hasCover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/cover/${bookId}`}
        alt={`غلاف كتاب ${title}`}
        loading="lazy"
        className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      />
    );
  }
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-night via-night-soft to-guard p-6 text-center ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(217,119,6,0.6), transparent 45%)",
        }}
      />
      <BookIcon className="h-10 w-10 text-shield-light" strokeWidth={1.5} />
      <span className="font-display text-lg font-extrabold leading-snug text-white drop-shadow">
        {title}
      </span>
    </div>
  );
}
