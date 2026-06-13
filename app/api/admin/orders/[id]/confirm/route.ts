import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { incrementCouponUse } from "@/lib/coupons";
import { fulfillOrder } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

// المدير يؤكّد استلام التحويل البنكي → تحويل الطلب إلى مدفوع وإرسال الكتاب/الحزمة
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { book: true, series: true } });
  if (!order) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  if (order.status === "PAID") return NextResponse.json({ ok: true, already: true });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
    include: { book: true, series: true },
  });

  // تثبيت استخدام الكوبون بعد تأكيد التحويل
  await incrementCouponUse(updated.couponCode);

  // إنشاء روابط التحميل وإرسال الإيصال والتسليم (كتاب مفرد أو حزمة)
  await fulfillOrder(updated);

  return NextResponse.json({ ok: true });
}
