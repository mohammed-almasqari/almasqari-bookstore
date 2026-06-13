import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import ConfirmOrderButton from "@/components/admin/ConfirmOrderButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "الطلبات" };

const STATUS: Record<string, { label: string; cls: string }> = {
  PAID: { label: "مدفوع", cls: "bg-safe/10 text-safe" },
  PENDING: { label: "معلّق", cls: "bg-amber-100 text-amber-700" },
  FAILED: { label: "فشل", cls: "bg-alert/10 text-alert" },
  REFUNDED: { label: "مُسترَد", cls: "bg-ink/10 text-ink-muted" },
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { book: true, series: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const paidTotal = orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.amountCents, 0);
  const pendingBank = orders.filter((o) => o.status === "PENDING" && o.paymentMethod === "BANK").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">الطلبات</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {orders.length} طلب · الإجمالي المدفوع {formatPrice(paidTotal, "USD")}
          {pendingBank > 0 && <span className="text-amber-700"> · {pendingBank} تحويل بنكي بانتظار التأكيد</span>}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-white p-12 text-center text-ink-muted">
          لا توجد طلبات بعد.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-card">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-muted">
              <tr>
                <th className="p-4 font-bold">العميل</th>
                <th className="p-4 font-bold">الكتاب</th>
                <th className="p-4 font-bold">المبلغ</th>
                <th className="p-4 font-bold">الطريقة</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">التاريخ</th>
                <th className="p-4 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {orders.map((o) => {
                const st = STATUS[o.status] ?? STATUS.PENDING;
                return (
                  <tr key={o.id} className="hover:bg-sand-50/50">
                    <td className="p-4">
                      <div className="font-bold text-ink">{o.customerName}</div>
                      <div dir="ltr" className="text-right text-xs text-ink-muted">{o.customerEmail}</div>
                      {o.bankReference && <div className="text-xs text-ink-muted">مرجع: {o.bankReference}</div>}
                    </td>
                    <td className="p-4 text-ink-soft">
                      {o.series ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="badge bg-shield/10 text-guard">حزمة</span>
                          سلسلة «{o.series.title}»
                        </span>
                      ) : (
                        o.book.title
                      )}
                    </td>
                    <td className="p-4 tnum font-bold text-ink">
                      {formatPrice(o.amountCents, o.currency)}
                      {o.discountCents > 0 && (
                        <div dir="ltr" className="mt-0.5 text-right text-[11px] font-bold text-safe">
                          {o.couponCode ? `${o.couponCode} ` : ""}−{formatPrice(o.discountCents, o.currency)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${o.paymentMethod === "BANK" ? "bg-steel/10 text-steel" : "bg-shield/10 text-guard"}`}>
                        {o.paymentMethod === "BANK" ? "تحويل بنكي" : "PayPal"}
                      </span>
                    </td>
                    <td className="p-4"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td className="p-4 text-xs text-ink-muted">{formatDateTime(o.createdAt)}</td>
                    <td className="p-4">
                      {o.status === "PENDING" && o.paymentMethod === "BANK" ? (
                        <ConfirmOrderButton id={o.id} />
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
