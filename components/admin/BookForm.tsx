"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerIcon, BookIcon, CheckIcon } from "@/components/icons";

export type BookFormData = {
  id?: string;
  title?: string;
  slug?: string;
  subtitle?: string | null;
  author?: string;
  category?: string | null;
  description?: string;
  pages?: number | null;
  isFree?: boolean;
  priceCents?: number;
  currency?: string;
  isPublished?: boolean;
  featured?: boolean;
  sortOrder?: number;
  coverFile?: string | null;
  bookFile?: string | null;
};

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-sand-200 bg-white p-3 text-right"
    >
      <span>
        <span className="font-bold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-safe" : "bg-sand-200"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "right-0.5" : "right-[22px]"}`} />
      </span>
    </button>
  );
}

export default function BookForm({ initial, mode }: { initial?: BookFormData; mode: "create" | "edit" }) {
  const router = useRouter();
  const [isFree, setIsFree] = useState(!!initial?.isFree);
  const [isPublished, setIsPublished] = useState(initial ? !!initial.isPublished : true);
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    // إرسال القيم المنطقية صراحةً (لا نعتمد على وجود مربعات الاختيار)
    fd.set("isFree", isFree ? "true" : "false");
    fd.set("isPublished", isPublished ? "true" : "false");
    fd.set("featured", featured ? "true" : "false");

    try {
      const url = mode === "create" ? "/api/admin/books" : `/api/admin/books/${initial?.id}`;
      const res = await fetch(url, { method: mode === "create" ? "POST" : "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر حفظ الكتاب.");
        return;
      }
      router.push("/admin/books");
      router.refresh();
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="mb-4 font-display text-lg font-extrabold text-ink">معلومات الكتاب</h3>
            <div className="space-y-4">
              <div>
                <label className="label">عنوان الكتاب *</label>
                <input name="title" className="input" defaultValue={initial?.title} required placeholder="مثال: لن يخدعوك بعد اليوم" />
              </div>
              <div>
                <label className="label">العنوان الفرعي</label>
                <input name="subtitle" className="input" defaultValue={initial?.subtitle ?? ""} placeholder="وصف موجز يظهر تحت العنوان" />
              </div>
              <div>
                <label className="label">الوصف *</label>
                <textarea name="description" className="input min-h-[150px]" defaultValue={initial?.description} required placeholder="نبذة عن محتوى الكتاب وفائدته للقارئ…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">المؤلف</label>
                  <input name="author" className="input" defaultValue={initial?.author ?? "محمد المسقري"} />
                </div>
                <div>
                  <label className="label">التصنيف</label>
                  <input name="category" className="input" defaultValue={initial?.category ?? ""} placeholder="الأمن الرقمي" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="mb-4 font-display text-lg font-extrabold text-ink">الملفات</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">ملف الكتاب (PDF)</label>
                <input name="bookFile" type="file" accept=".pdf,.epub,.zip" className="input file:ml-3 file:rounded-lg file:border-0 file:bg-shield file:px-3 file:py-1.5 file:text-white" />
                {initial?.bookFile && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-safe"><CheckIcon className="h-3.5 w-3.5" /> ملف مرفوع حاليًا</p>
                )}
              </div>
              <div>
                <label className="label">صورة الغلاف</label>
                <input name="cover" type="file" accept="image/*" className="input file:ml-3 file:rounded-lg file:border-0 file:bg-shield file:px-3 file:py-1.5 file:text-white" />
                {initial?.coverFile && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-safe"><CheckIcon className="h-3.5 w-3.5" /> غلاف مرفوع حاليًا</p>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-muted">الحد الأقصى للملف 60 ميغابايت. في وضع التعديل، اترك الحقل فارغًا للإبقاء على الملف الحالي.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="mb-4 font-display text-lg font-extrabold text-ink">النشر والسعر</h3>
            <div className="space-y-3">
              <Switch label="منشور" hint="يظهر في المتجر" checked={isPublished} onChange={setIsPublished} />
              <Switch label="مميّز" hint="يظهر في الواجهة" checked={featured} onChange={setFeatured} />
              <Switch label="كتاب مجاني" hint="يُستلم بالبريد بعد التأكيد" checked={isFree} onChange={setIsFree} />

              {!isFree && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="label">السعر</label>
                    <input name="price" type="number" step="0.01" min="0" dir="ltr" className="input" defaultValue={initial?.priceCents ? (initial.priceCents / 100).toFixed(2) : ""} placeholder="9.90" />
                  </div>
                  <div>
                    <label className="label">العملة</label>
                    <select name="currency" className="input" defaultValue={initial?.currency ?? "USD"}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-sand-200 bg-white p-6">
            <h3 className="mb-4 font-display text-lg font-extrabold text-ink">إعدادات إضافية</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">عدد الصفحات</label>
                  <input name="pages" type="number" min="0" dir="ltr" className="input" defaultValue={initial?.pages ?? ""} />
                </div>
                <div>
                  <label className="label">الترتيب</label>
                  <input name="sortOrder" type="number" dir="ltr" className="input" defaultValue={initial?.sortOrder ?? 0} />
                </div>
              </div>
              <div>
                <label className="label">معرّف الرابط (اختياري)</label>
                <input name="slug" dir="ltr" className="input" defaultValue={initial?.slug ?? ""} placeholder="my-book" />
                <p className="mt-1 text-xs text-ink-muted">يُولّد تلقائيًا من العنوان إن تُرك فارغًا.</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <SpinnerIcon className="h-5 w-5" /> : <BookIcon className="h-5 w-5" />}
            {loading ? "جارٍ الحفظ…" : mode === "create" ? "إضافة الكتاب" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </form>
  );
}
