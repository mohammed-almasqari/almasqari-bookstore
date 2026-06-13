"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerIcon, CheckIcon } from "@/components/icons";

export type PostFormData = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  isPublished?: boolean;
  coverFile?: string | null;
};

export default function PostForm({ initial, mode }: { initial?: PostFormData; mode: "create" | "edit" }) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initial ? !!initial.isPublished : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("isPublished", isPublished ? "true" : "false");
    try {
      const url = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${initial?.id}`;
      const res = await fetch(url, { method: mode === "create" ? "POST" : "PATCH", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "تعذّر الحفظ.");
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>}
      <div className="rounded-2xl border border-sand-200 bg-surface p-6">
        <div className="space-y-4">
          <div>
            <label className="label">عنوان المقال *</label>
            <input name="title" className="input" defaultValue={initial?.title} required placeholder="مثال: 5 علامات تكشف رسالة احتيال" />
          </div>
          <div>
            <label className="label">مقتطف قصير</label>
            <input name="excerpt" className="input" defaultValue={initial?.excerpt ?? ""} placeholder="جملة تظهر في قائمة المقالات ونتائج البحث" />
          </div>
          <div>
            <label className="label">المحتوى *</label>
            <textarea name="content" className="input min-h-[300px]" defaultValue={initial?.content} required placeholder="اكتب المقال هنا… كل سطر فارغ يبدأ فقرة جديدة." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">صورة المقال</label>
              <input name="cover" type="file" accept="image/*" className="input file:ml-3 file:rounded-lg file:border-0 file:bg-shield file:px-3 file:py-1.5 file:text-white" />
              {initial?.coverFile && <p className="mt-1.5 flex items-center gap-1 text-xs text-safe"><CheckIcon className="h-3.5 w-3.5" /> صورة مرفوعة</p>}
            </div>
            <div>
              <label className="label">معرّف الرابط (اختياري)</label>
              <input name="slug" dir="ltr" className="input" defaultValue={initial?.slug ?? ""} placeholder="my-article" />
            </div>
          </div>
          <button type="button" onClick={() => setIsPublished((v) => !v)} className="flex w-full max-w-xs items-center justify-between gap-3 rounded-xl border border-sand-200 bg-sand-50 p-3">
            <span className="font-bold text-ink">منشور</span>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${isPublished ? "bg-safe" : "bg-sand-200"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${isPublished ? "right-0.5" : "right-[22px]"}`} />
            </span>
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <SpinnerIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
        {mode === "create" ? "نشر المقال" : "حفظ التعديلات"}
      </button>
    </form>
  );
}
