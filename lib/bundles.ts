import { prisma } from "@/lib/db";

export type ResolvedBundle = {
  seriesId: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
  firstBookId: string;
  books: { id: string; title: string }[];
  regularTotalCents: number;
};

/**
 * يحضّر حزمة سلسلة قابلة للشراء: السعر، أول كتاب (للربط بالطلب)، وكل كتبها المنشورة للتسليم.
 * يُرجع null إن لم تكن السلسلة منشورة أو لا سعر حزمة لها أو لا كتب فيها.
 */
export async function resolveBundle(seriesId: string): Promise<ResolvedBundle | null> {
  const series = await prisma.series.findFirst({
    where: { id: seriesId, isPublished: true },
    include: {
      books: {
        where: { isPublished: true },
        orderBy: { seriesOrder: "asc" },
        select: { id: true, title: true, priceCents: true, currency: true, isFree: true },
      },
    },
  });
  if (!series || series.bundlePriceCents <= 0 || series.books.length < 1) return null;

  const currency = series.books.find((b) => !b.isFree)?.currency || series.books[0].currency || "USD";
  const regularTotalCents = series.books.reduce((s, b) => s + (b.isFree ? 0 : b.priceCents), 0);

  return {
    seriesId: series.id,
    title: series.title,
    slug: series.slug,
    priceCents: series.bundlePriceCents,
    currency,
    firstBookId: series.books[0].id,
    books: series.books.map((b) => ({ id: b.id, title: b.title })),
    regularTotalCents,
  };
}
