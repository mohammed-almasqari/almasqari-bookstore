import { prisma } from "@/lib/db";

export function normalizeRef(raw: string): string {
  return (raw || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
}

/** يسجّل نقرة على رابط إحالة (إن كان الرمز فعّالًا). */
export async function recordReferralClick(rawCode: string): Promise<void> {
  const code = normalizeRef(rawCode);
  if (!code) return;
  await prisma.referral.updateMany({ where: { code, active: true }, data: { clicks: { increment: 1 } } }).catch(() => {});
}

/** يُضيف عملية شراء مكتملة وعمولتها إلى رصيد شريك الإحالة بعد الدفع. */
export async function creditReferral(rawCode: string | null | undefined, amountCents: number): Promise<void> {
  if (!rawCode) return;
  const code = normalizeRef(rawCode);
  if (!code) return;
  const ref = await prisma.referral.findUnique({ where: { code } });
  if (!ref || !ref.active) return;
  const commission = Math.max(0, Math.round((amountCents * ref.commissionPercent) / 100));
  await prisma.referral
    .update({ where: { code }, data: { orders: { increment: 1 }, earningsCents: { increment: commission } } })
    .catch(() => {});
}
