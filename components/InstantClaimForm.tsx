"use client";

import { useState } from "react";
import { CheckIcon, MailIcon, GiftIcon, DownloadIcon, SpinnerIcon, LockIcon } from "./icons";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * نموذج تسجيل مضمّن في صفحة الكتاب المجاني — تسليم فوري:
 * يُسجّل الزائر اسمه وبريده فيصله الكتاب فورًا بالبريد ويظهر زر تحميل مباشر.
 */
export default function InstantClaimForm({ bookId, title }: { bookId: string; title: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ downloadUrl?: string } | null>(null);

  const ok = name.trim().length >= 2 && isValidEmail(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name, email, optIn, instant: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر إتمام التسجيل. حاول مرة أخرى.");
        return;
      }
      setDone({ downloadUrl: data.downloadUrl });
    } catch {
      setError("حدث خطأ في الشبكة. تحقّق من اتصالك وحاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-safe text-white">
          <CheckIcon className="h-9 w-9" strokeWidth={2.5} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-extrabold text-ink">كتابك جاهز! 🎉</h3>
        <p className="mx-auto mt-2 max-w-md leading-8 text-ink-soft">
          أرسلنا «{title}» إلى <span dir="ltr" className="font-bold text-ink">{email}</span>،
          ويمكنك تحميله الآن مباشرة:
        </p>
        {done.downloadUrl && (
          <a href={done.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-safe mt-5 w-full">
            <DownloadIcon className="h-5 w-5" /> تحميل «{title}» الآن
          </a>
        )}
        <p className="mt-4 text-xs text-ink-muted">لم تجد البريد؟ تحقّق من مجلد «الرسائل غير المرغوبة» (Spam).</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">الاسم</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
      </div>
      <div>
        <label className="label">البريد الإلكتروني (لاستلام الكتاب)</label>
        <input className="input" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-sand-50 p-3 text-sm text-ink-soft">
        <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="mt-1 h-4 w-4 accent-shield" />
        <span>أوافق على استلام إشعارات بالكتب والمحتوى الجديد (يمكنك إلغاء الاشتراك في أي وقت).</span>
      </label>
      {error && <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>}
      <button type="submit" disabled={!ok || loading} className="btn-safe w-full text-base">
        {loading ? <SpinnerIcon className="h-5 w-5" /> : <GiftIcon className="h-5 w-5" />}
        {loading ? "جارٍ التجهيز…" : "أرسل لي الكتاب مجانًا الآن"}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
        <LockIcon className="h-3.5 w-3.5 text-safe" /> تسليم فوري · رابط آمن · لا نشارك بريدك مع أحد.
      </p>
    </form>
  );
}
