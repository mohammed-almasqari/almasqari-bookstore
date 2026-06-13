"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { TrashIcon, CheckIcon, SpinnerIcon } from "@/components/icons";

export type ReviewRow = {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  date: string;
  bookTitle: string;
};

export default function ReviewModerator({ initial }: { initial: ReviewRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("حذف هذا التقييم نهائيًا؟")) return;
    setBusy(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }
  async function toggle(id: string, approved: boolean) {
    setBusy(id);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    setBusy(null);
    if (res.ok) router.refresh(); else alert("تعذّر التحديث.");
  }

  if (initial.length === 0) {
    return <div className="rounded-2xl border border-dashed border-sand-200 bg-surface p-12 text-center text-ink-muted">لا توجد تقييمات بعد.</div>;
  }

  return (
    <ul className="space-y-3">
      {initial.map((r) => (
        <li key={r.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{r.name}</span>
              <StarRating value={r.rating} />
              {!r.approved && <span className="badge bg-amber-100 text-amber-700">مخفي</span>}
            </div>
            {r.comment && <p className="mt-2 leading-7 text-ink-soft">{r.comment}</p>}
            <p className="mt-1 text-xs text-ink-muted">عن «{r.bookTitle}» · {r.date}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => toggle(r.id, r.approved)} disabled={busy === r.id} className="btn-ghost h-9 px-3 text-xs">
              {busy === r.id ? <SpinnerIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              {r.approved ? "إخفاء" : "إظهار"}
            </button>
            <button onClick={() => remove(r.id)} disabled={busy === r.id} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
