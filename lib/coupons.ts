import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export type CouponResult =
  | {
      ok: true;
      code: string;
      discountCents: number;
      finalCents: number;
      discountLabel: string;
      finalLabel: string;
    }
  | { ok: false; error: string };

export function normalizeCode(raw: string): string {
  return (raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * يتحقق من صلاحية كوبون على مبلغ طلب معيّن ويحسب الخصم.
 * لا يعدّل قاعدة البيانات (التحقق فقط) — زيادة عدّاد الاستخدام تتم عند اكتمال الدفع.
 */
export async function validateCoupon(
  rawCode: string,
  amountCents: number,
  currency = "USD"
): Promise<CouponResult> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "أدخل رمز الكوبون." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { ok: false, error: "رمز الكوبون غير صحيح أو غير مفعّل." };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "انتهت صلاحية هذا الكوبون." };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "تم استنفاد عدد مرات استخدام هذا الكوبون." };
  }
  if (amountCents < coupon.minCents) {
    return {
      ok: false,
      error: `هذا الكوبون يتطلّب حدًّا أدنى للطلب قدره ${formatPrice(coupon.minCents, currency)}.`,
    };
  }

  // حساب الخصم
  let discountCents =
    coupon.type === "PERCENT"
      ? Math.round((amountCents * coupon.value) / 100)
      : coupon.value;

  // لا يتجاوز الخصم قيمة الطلب، ونُبقي سنتًا واحدًا على الأقل (PayPal لا يقبل صفرًا)
  discountCents = Math.max(0, Math.min(discountCents, amountCents - 1));
  const finalCents = amountCents - discountCents;

  if (discountCents <= 0) {
    return { ok: false, error: "لا ينطبق خصم على هذا الطلب." };
  }

  return {
    ok: true,
    code,
    discountCents,
    finalCents,
    discountLabel: formatPrice(discountCents, currency),
    finalLabel: formatPrice(finalCents, currency),
  };
}

/** يزيد عدّاد استخدام الكوبون بعد اكتمال الدفع فعليًا. */
export async function incrementCouponUse(code?: string | null): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  if (!normalized) return;
  await prisma.coupon
    .update({ where: { code: normalized }, data: { usedCount: { increment: 1 } } })
    .catch(() => {});
}
