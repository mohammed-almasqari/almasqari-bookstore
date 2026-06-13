import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import ReviewModerator, { type ReviewRow } from "@/components/admin/ReviewModerator";

export const dynamic = "force-dynamic";
export const metadata = { title: "التقييمات" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { book: { select: { title: true } } },
  });
  const rows: ReviewRow[] = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    approved: r.approved,
    date: formatDate(r.createdAt),
    bookTitle: r.book.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">التقييمات</h1>
        <p className="mt-1 text-sm text-ink-muted">{reviews.length} تقييم · يمكنك إخفاء أو حذف أي تقييم.</p>
      </div>
      <ReviewModerator initial={rows} />
    </div>
  );
}
