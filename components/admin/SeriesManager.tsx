"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, SpinnerIcon } from "@/components/icons";

export type SeriesRow = { id: string; title: string; slug: string; description: string | null; sortOrder: number; isPublished: boolean; bookCount: number };

export default function SeriesManager({ initial }: { initial: SeriesRow[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
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
        body: JSON.stringify({ title, description, sortOrder: Number(sortOrder) || 0 }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "تعذّر الإنشاء."); return; }
      setTitle(""); setDescription(""); setSortOrder("0");
      router.refresh();
    } catch { setError("خطأ في الشبكة."); } finally { setLoading(false); }
  }

  async function remove(id: string, t: string) {
    if (!window.confirm(`حذف سلسلة «${t}»؟ ستبقى الكتب لكن تُفصل عن السلسلة.`)) return;
    const res = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-extrabold text-ink">إضافة سلسلة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم السلسلة *</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: سلسلة الثروة الرقمية" />
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

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
        {initial.length === 0 ? (
          <p className="p-8 text-center text-ink-muted">لا توجد سلاسل بعد.</p>
        ) : (
          <ul className="divide-y divide-sand-100">
            {initial.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="font-bold text-ink">{s.title}</div>
                  <div className="text-xs text-ink-muted">{s.bookCount} كتب · /series/{s.slug}{!s.isPublished && " · غير منشورة"}</div>
                </div>
                <button onClick={() => remove(s.id, s.title)} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
