"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, SpinnerIcon, TagIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  minCents: number;
  expiresAt: string | null;
};

function valueLabel(c: CouponRow) {
  return c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value);
}

export default function CouponManager({ initial }: { initial: CouponRow[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(value);
    if (code.trim().length < 2 || !v || v <= 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      // القيمة الثابتة بالسنت، النسبة كما هي
      const payloadValue = type === "FIXED" ? Math.round(v * 100) : Math.round(v);
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          type,
          value: payloadValue,
          minCents: minAmount ? Math.round(Number(minAmount) * 100) : 0,
          maxUses: maxUses || null,
          expiresAt: expiresAt || null,
          description,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "تعذّر إنشاء الكوبون.");
        return;
      }
      setCode(""); setValue(""); setMinAmount(""); setMaxUses(""); setExpiresAt(""); setDescription("");
      router.refresh();
    } catch {
      setError("خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(c: CouponRow) {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(c: CouponRow) {
    if (!window.confirm(`حذف الكوبون «${c.code}»؟`)) return;
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">إنشاء كوبون خصم</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">الرمز *</label>
            <input className="input" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
          </div>
          <div>
            <label className="label">نوع الخصم</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}>
              <option value="PERCENT">نسبة مئوية (%)</option>
              <option value="FIXED">مبلغ ثابت</option>
            </select>
          </div>
          <div>
            <label className="label">{type === "PERCENT" ? "النسبة (1-100)" : "المبلغ (بالدولار)"} *</label>
            <input className="input" type="number" dir="ltr" step={type === "PERCENT" ? "1" : "0.01"} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "PERCENT" ? "10" : "5.00"} />
          </div>
          <div>
            <label className="label">أدنى مبلغ للطلب (اختياري)</label>
            <input className="input" type="number" dir="ltr" step="0.01" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">حد الاستخدام (اختياري)</label>
            <input className="input" type="number" dir="ltr" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="غير محدود" />
          </div>
          <div>
            <label className="label">تاريخ الانتهاء (اختياري)</label>
            <input className="input" type="date" dir="ltr" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">وصف داخلي (اختياري)</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: حملة إطلاق السلسلة" />
        </div>
        {error && <div className="mt-3 rounded-lg bg-alert/10 p-3 text-sm font-bold text-alert">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />} إنشاء الكوبون
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
        {initial.length === 0 ? (
          <p className="p-8 text-center text-ink-muted">لا توجد كوبونات بعد.</p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {initial.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
              const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-4 w-4 text-shield" />
                      <span dir="ltr" className="font-mono text-base font-extrabold text-ink">{c.code}</span>
                      <span className="badge bg-shield/10 text-guard">{valueLabel(c)}</span>
                      {!c.active && <span className="badge bg-ink/10 text-ink-muted">معطّل</span>}
                      {expired && <span className="badge bg-alert/10 text-alert">منتهٍ</span>}
                      {exhausted && <span className="badge bg-alert/10 text-alert">مُستنفَد</span>}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">
                      استُخدم {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : " مرة"}
                      {c.minCents > 0 && ` · حد أدنى ${formatPrice(c.minCents)}`}
                      {c.expiresAt && ` · ينتهي ${new Date(c.expiresAt).toLocaleDateString("ar")}`}
                      {c.description && ` · ${c.description}`}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggle(c)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                        c.active ? "border-sand-200 text-ink-muted hover:border-ink" : "border-safe/40 text-safe hover:bg-safe/10"
                      }`}
                    >
                      {c.active ? "تعطيل" : "تفعيل"}
                    </button>
                    <button onClick={() => remove(c)} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
