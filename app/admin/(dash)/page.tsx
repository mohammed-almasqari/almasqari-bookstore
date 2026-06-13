import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { BookIcon, ReceiptIcon, UsersIcon, ChartIcon, GiftIcon, PlusIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة المعلومات" };

async function getStats() {
  const [booksCount, freeCount, paidOrders, revenue, subscribers, recentOrders, recentSubs] =
    await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { isFree: true } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
      prisma.freeClaim.count({ where: { confirmed: true } }),
      prisma.order.findMany({
        where: { status: "PAID" },
        include: { book: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.freeClaim.findMany({
        where: { confirmed: true },
        include: { book: true },
        orderBy: { confirmedAt: "desc" },
        take: 5,
      }),
    ]);
  return {
    booksCount,
    freeCount,
    paidOrders,
    revenueCents: revenue._sum.amountCents ?? 0,
    subscribers,
    recentOrders,
    recentSubs,
  };
}

export default async function DashboardPage() {
  const s = await getStats();

  const cards = [
    { label: "إجمالي المبيعات", value: formatPrice(s.revenueCents, "USD"), icon: ChartIcon, color: "text-safe", bg: "bg-safe/10" },
    { label: "طلبات مدفوعة", value: String(s.paidOrders), icon: ReceiptIcon, color: "text-guard", bg: "bg-shield/10" },
    { label: "مشتركون مؤكَّدون", value: String(s.subscribers), icon: UsersIcon, color: "text-steel", bg: "bg-steel/10" },
    { label: "عدد الكتب", value: `${s.booksCount} (${s.freeCount} مجاني)`, icon: BookIcon, color: "text-ink", bg: "bg-ink/5" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">لوحة المعلومات</h1>
          <p className="mt-1 text-sm text-ink-muted">نظرة سريعة على أداء متجرك.</p>
        </div>
        <Link href="/admin/books/new" className="btn-primary h-11 px-5 text-sm">
          <PlusIcon className="h-5 w-5" /> إضافة كتاب
        </Link>
      </div>

      {/* البطاقات */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-sand-200 bg-surface p-5 shadow-card">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${c.bg} ${c.color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="mt-4 font-display text-2xl font-extrabold text-ink tnum">{c.value}</div>
              <div className="mt-1 text-sm text-ink-muted">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* أحدث الطلبات */}
        <div className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">أحدث الطلبات</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-shield hover:underline">عرض الكل</Link>
          </div>
          {s.recentOrders.length ? (
            <ul className="divide-y divide-sand-100">
              {s.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink">{o.customerName}</div>
                    <div className="truncate text-xs text-ink-muted">{o.book.title}</div>
                  </div>
                  <div className="text-left">
                    <div className="tnum font-bold text-safe">{formatPrice(o.amountCents, o.currency)}</div>
                    <div className="text-[11px] text-ink-muted">{formatDateTime(o.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">لا توجد طلبات بعد.</p>
          )}
        </div>

        {/* أحدث المشتركين */}
        <div className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold text-ink">أحدث المشتركين</h2>
            <Link href="/admin/subscribers" className="text-sm font-bold text-shield hover:underline">عرض الكل</Link>
          </div>
          {s.recentSubs.length ? (
            <ul className="divide-y divide-sand-100">
              {s.recentSubs.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink">{c.name}</div>
                    <div dir="ltr" className="truncate text-xs text-ink-muted text-right">{c.email}</div>
                  </div>
                  <span className="badge-free shrink-0"><GiftIcon className="h-3.5 w-3.5" /> {c.book.title.slice(0, 14)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">لا يوجد مشتركون بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
