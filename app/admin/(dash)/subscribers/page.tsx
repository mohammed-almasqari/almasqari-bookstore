import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { CheckIcon, MailIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "المشتركون" };

export default async function SubscribersPage() {
  const subs = await prisma.freeClaim.findMany({
    include: { book: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const confirmed = subs.filter((s) => s.confirmed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">المشتركون</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {subs.length} تسجيل · {confirmed} مؤكَّد بالبريد
        </p>
      </div>

      {subs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-white p-12 text-center text-ink-muted">
          لا يوجد مشتركون بعد. شارك صفحة الكتب المجانية لجمع القرّاء.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-card">
          <table className="w-full min-w-[620px] text-right text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-xs text-ink-muted">
              <tr>
                <th className="p-4 font-bold">الاسم</th>
                <th className="p-4 font-bold">البريد</th>
                <th className="p-4 font-bold">الكتاب</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-sand-50/50">
                  <td className="p-4 font-bold text-ink">{s.name}</td>
                  <td dir="ltr" className="p-4 text-right text-ink-soft">{s.email}</td>
                  <td className="p-4 text-ink-soft">{s.book.title}</td>
                  <td className="p-4">
                    {s.confirmed ? (
                      <span className="badge bg-safe/10 text-safe"><CheckIcon className="h-3 w-3" /> مؤكَّد</span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700"><MailIcon className="h-3 w-3" /> بانتظار التأكيد</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-ink-muted">{formatDateTime(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
