"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarIcon, CheckIcon, SpinnerIcon } from "./icons";

export default function ReviewForm({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name, rating, comment }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "تعذّر إرسال التقييم.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-6 text-center">
        <CheckIcon className="mx-auto h-10 w-10 text-safe" strokeWidth={2.5} />
        <p className="mt-2 font-bold text-ink">شكرًا لتقييمك! 🌟</p>
        <p className="text-sm text-ink-muted">سيظهر رأيك للقرّاء الآخرين.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-sand-200 bg-surface p-6">
      <h3 className="font-display text-lg font-extrabold text-ink">أضف تقييمك</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="label">تقييمك</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${i} نجوم`}
                className="p-0.5"
              >
                <StarIcon className={`h-7 w-7 transition-colors ${i <= (hover || rating) ? "text-shield" : "text-sand-200"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">الاسم</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" />
        </div>
        <div>
          <label className="label">رأيك (اختياري)</label>
          <textarea className="input min-h-[90px]" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="ما الذي أعجبك في الكتاب؟" />
        </div>
        {error && <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>}
        <button type="submit" disabled={loading || name.trim().length < 2} className="btn-primary">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
          نشر التقييم
        </button>
      </div>
    </form>
  );
}
