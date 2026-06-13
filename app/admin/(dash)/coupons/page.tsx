import { prisma } from "@/lib/db";
import CouponManager, { type CouponRow } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "كوبونات الخصم" };

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const rows: CouponRow[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    type: c.type,
    value: c.value,
    active: c.active,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    minCents: c.minCents,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">كوبونات الخصم</h1>
        <p className="mt-1 text-sm text-ink-muted">أنشئ رموز خصم بنسبة مئوية أو مبلغ ثابت، تُطبَّق على الدفع عبر PayPal والتحويل البنكي.</p>
      </div>
      <CouponManager initial={rows} />
    </div>
  );
}
