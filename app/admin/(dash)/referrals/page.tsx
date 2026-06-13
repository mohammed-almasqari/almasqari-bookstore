import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import ReferralManager, { type ReferralRow } from "@/components/admin/ReferralManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "برنامج الإحالة" };

export default async function ReferralsPage() {
  const referrals = await prisma.referral.findMany({ orderBy: { createdAt: "desc" } });
  const rows: ReferralRow[] = referrals.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    email: r.email,
    commissionPercent: r.commissionPercent,
    clicks: r.clicks,
    orders: r.orders,
    earningsCents: r.earningsCents,
    active: r.active,
  }));
  const baseUrl = env.siteUrl.replace(/\/$/, "");

  const totalEarnings = referrals.reduce((s, r) => s + r.earningsCents, 0);
  const totalOrders = referrals.reduce((s, r) => s + r.orders, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">برنامج الإحالة</h1>
        <p className="mt-1 text-sm text-ink-muted">
          أنشئ شركاء بروابط إحالة خاصة، يكسبون عمولة على كل عملية شراء عبر رابطهم.
          {totalOrders > 0 && ` — ${totalOrders} عملية، إجمالي عمولات ${(totalEarnings / 100).toFixed(2)} دولار`}
        </p>
      </div>
      <ReferralManager initial={rows} baseUrl={baseUrl} />
    </div>
  );
}
