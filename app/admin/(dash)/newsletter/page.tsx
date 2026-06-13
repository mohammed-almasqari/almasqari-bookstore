import { prisma } from "@/lib/db";
import NewsletterForm from "@/components/admin/NewsletterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "النشرة البريدية" };

export default async function NewsletterPage() {
  const subs = await prisma.freeClaim.findMany({
    where: { confirmed: true, optInUpdates: true },
    distinct: ["email"],
    select: { email: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">النشرة البريدية</h1>
        <p className="mt-1 text-sm text-ink-muted">أرسل رسالة جماعية لمشتركيك (عبر Resend).</p>
      </div>
      <NewsletterForm count={subs.length} />
    </div>
  );
}
