"use client";

import { useState } from "react";
import { CheckIcon, MailIcon, GiftIcon, SpinnerIcon } from "./icons";

type FreeBook = { id: string; title: string };

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function FreeClaimForm({ books }: { books: FreeBook[] }) {
  const [bookId, setBookId] = useState(books[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const ok = name.trim().length >= 2 && isValidEmail(email) && bookId;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name, email, optIn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر إتمام التسجيل. حاول مرة أخرى.");
        return;
      }
      setSent(true);
    } catch {
      setError("حدث خطأ في الشبكة. تحقّق من اتصالك وحاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-safe text-white">
          <MailIcon className="h-9 w-9" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">تحقّق من بريدك الآن 📬</h3>
        <p className="mx-auto mt-3 max-w-md leading-8 text-ink-soft">
          أرسلنا رسالة تأكيد إلى <span dir="ltr" className="font-bold text-ink">{email}</span>.
          افتحها واضغط زر التأكيد، وسيصلك الكتاب فورًا برابط تحميل آمن.
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          لم تجد الرسالة؟ تحقّق من مجلد «الرسائل غير المرغوبة» (Spam).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {books.length > 1 && (
        <div>
          <label className="label">اختر الكتاب</label>
          <select className="input" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">الاسم</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
      </div>

      <div>
        <label className="label">البريد الإلكتروني</label>
        <input
          className="input"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-sand-50 p-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="mt-1 h-4 w-4 accent-shield"
        />
        <span>أوافق على استلام إشعارات بالكتب والمحتوى الجديد (يمكنك إلغاء الاشتراك في أي وقت).</span>
      </label>

      {error && (
        <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>
      )}

      <button type="submit" disabled={!ok || loading} className="btn-safe w-full">
        {loading ? <SpinnerIcon className="h-5 w-5" /> : <GiftIcon className="h-5 w-5" />}
        {loading ? "جارٍ الإرسال…" : "أرسل لي الكتاب مجانًا"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
        <CheckIcon className="h-3.5 w-3.5 text-safe" /> نحترم خصوصيتك ولن نشارك بريدك مع أي جهة.
      </p>
    </form>
  );
}
