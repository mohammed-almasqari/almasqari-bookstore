"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, SpinnerIcon, LayersIcon, CheckIcon } from "@/components/icons";

export type SeriesRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  bundlePriceCents: number;
  bookCount: number;
};

function SeriesItem({ s }: { s: SeriesRow }) {
  const router = useRouter();
  const [bundle, setBundle] = useState(s.bundlePriceCents ? (s.bundlePriceCents / 100).toFixed(2) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveBundle() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/series/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundlePriceCents: bundle ? Math.round(Number(bundle) * 100) : 0 }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`حذف سلسلة «${s.title}»؟ ستبقى الكتب لكن تُفصل عن السلسلة.`)) return;
    const res = await fetch(`/api/admin/series/${s.id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-bold text-ink">{s.title}</div>
        <div className="text-xs text-ink-muted">{s.bookCount} كتب · /series/{s.slug}{!s.isPublished && " · غير منشورة"}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-sand-200 bg-sand-50 px-3 py-1.5" title="سعر الحزمة (بالدولار)">
          <LayersIcon className="h-4 w-4 text-shield" />
          <input
            className="w-20 bg-transparent text-sm font-bold text-ink outline-none tnum"
            type="number"
            dir="ltr"
            step="0.01"
            value={bundle}
            onChange={(e) => setBundle(e.target.value)}
            placeholder="حزمة $"
          />
          <button onClick={saveBundle} disabled={saving} className="text-xs font-bold text-shield hover:text-guard" title="حفظ سعر الحزمة">
            {saving ? <SpinnerIcon className="h-4 w-4" /> : saved ? <CheckIcon className="h-4 w-4 text-safe" /> : "حفظ"}
          </button>
        </div>
        <button onClick={remove} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export default function SeriesManager({ initial }: { initial: SeriesRow[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [bundlePrice, setBundlePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2 || loading) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          sortOrder: Number(sortOrder) || 0,
          bundlePriceCents: bundlePrice ? Math.round(Number(bundlePrice) * 100) : 0,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "تعذّر الإنشاء."); return; }
      setTitle(""); setDescription(""); setSortOrder("0"); setBundlePrice("");
      router.refresh();
    } catch { setError("خطأ في الشبكة."); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">إضافة سلسلة</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">اسم السلسلة *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: سلسلة الثروة الرقمية" />
          </div>
          <div>
            <label className="label">سعر الحزمة (بالدولار)</label>
            <input className="input" type="number" dir="ltr" step="0.01" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} placeholder="اختياري — للسلسلة كاملة" />
          </div>
          <div>
            <label className="label">الترتيب</label>
            <input className="input" type="number" dir="ltr" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">وصف السلسلة</label>
          <textarea className="input min-h-[70px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ماذا يكسب القارئ من إكمال السلسلة كاملة؟" />
        </div>
        {error && <div className="mt-3 rounded-lg bg-alert/10 p-3 text-sm font-bold text-alert">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />} إضافة السلسلة
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-surface shadow-card">
        <div className="border-b border-sand-100 bg-sand-50 px-4 py-2.5 text-xs font-bold text-ink-muted">
          السلاسل — اضبط «سعر الحزمة» ليظهر عرض شراء السلسلة كاملة في صفحتها
        </div>
        {initial.length === 0 ? (
          <p className="p-8 text-center text-ink-muted">لا توجد سلاسل بعد.</p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {initial.map((s) => <SeriesItem key={s.id} s={s} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
