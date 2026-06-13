"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, SpinnerIcon, ShareIcon, CopyIcon, CheckIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

export type ReferralRow = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  commissionPercent: number;
  clicks: number;
  orders: number;
  earningsCents: number;
  active: boolean;
};

function ReferralItem({ r, baseUrl }: { r: ReferralRow; baseUrl: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const link = `${baseUrl}/r/${r.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* تجاهل */
    }
  }

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/referrals/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) router.refresh();
  }

  async function remove() {
    if (!window.confirm(`حذف شريك الإحالة «${r.name}» (${r.code})؟`)) return;
    const res = await fetch(`/api/admin/referrals/${r.id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }

  return (
    <li className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ShareIcon className="h-4 w-4 text-shield" />
          <span className="font-bold text-ink">{r.name}</span>
          <span dir="ltr" className="font-mono text-sm font-extrabold text-guard">{r.code}</span>
          <span className="badge bg-shield/10 text-guard">{r.commissionPercent}% عمولة</span>
          {!r.active && <span className="badge bg-ink/10 text-ink-muted">معطّل</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {r.email && <span dir="ltr">{r.email}</span>}
          <span>{r.clicks} نقرة</span>
          <span>{r.orders} عملية شراء</span>
          <span className="font-bold text-safe">الرصيد: {formatPrice(r.earningsCents)}</span>
        </div>
        <button onClick={copy} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-sand-200 bg-sand-50 px-2.5 py-1 text-xs font-bold text-ink-soft hover:border-shield hover:text-shield">
          {copied ? <CheckIcon className="h-3.5 w-3.5 text-safe" /> : <CopyIcon className="h-3.5 w-3.5" />}
          <span dir="ltr" className="truncate max-w-[240px]">{link}</span>
        </button>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {r.earningsCents > 0 && (
          <button
            onClick={() => { if (window.confirm("تصفير رصيد العمولة وعدد العمليات (بعد دفع المستحقات)؟")) patch({ resetEarnings: true }); }}
            className="rounded-lg border border-sand-200 px-3 py-1.5 text-xs font-bold text-ink-muted hover:border-ink"
          >
            تصفير الرصيد
          </button>
        )}
        <button
          onClick={() => patch({ active: !r.active })}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
            r.active ? "border-sand-200 text-ink-muted hover:border-ink" : "border-safe/40 text-safe hover:bg-safe/10"
          }`}
        >
          {r.active ? "تعطيل" : "تفعيل"}
        </button>
        <button onClick={remove} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export default function ReferralManager({ initial, baseUrl }: { initial: ReferralRow[]; baseUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commission, setCommission] = useState("20");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, commissionPercent: Number(commission) || 20, code: code || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "تعذّر الإنشاء."); return; }
      setName(""); setEmail(""); setCommission("20"); setCode("");
      router.refresh();
    } catch { setError("خطأ في الشبكة."); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">إضافة شريك إحالة</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">اسم الشريك *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد المروّج" />
          </div>
          <div>
            <label className="label">البريد (اختياري)</label>
            <input className="input" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@example.com" />
          </div>
          <div>
            <label className="label">نسبة العمولة %</label>
            <input className="input" type="number" dir="ltr" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="20" />
          </div>
          <div>
            <label className="label">رمز مخصّص (اختياري)</label>
            <input className="input" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="يُولَّد تلقائيًا" />
          </div>
        </div>
        {error && <div className="mt-3 rounded-lg bg-alert/10 p-3 text-sm font-bold text-alert">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />} إضافة الشريك
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-surface shadow-card">
        {initial.length === 0 ? (
          <p className="p-8 text-center text-ink-muted">لا يوجد شركاء إحالة بعد.</p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {initial.map((r) => <ReferralItem key={r.id} r={r} baseUrl={baseUrl} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
