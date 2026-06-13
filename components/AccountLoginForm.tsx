"use client";

import { useState } from "react";
import { MailIcon, SpinnerIcon, CheckIcon } from "./icons";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function AccountLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email) || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "تعذّر الإرسال.");
        return;
      }
      setSent(true);
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-7 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-safe text-white">
          <MailIcon className="h-8 w-8" />
        </span>
        <h3 className="mt-4 font-display text-xl font-extrabold text-ink">تحقّق من بريدك</h3>
        <p className="mt-2 leading-8 text-ink-soft">
          إن كان لديك مشتريات أو كتب مجانية بهذا البريد، فسيصلك رابط للدخول إلى مكتبتك خلال لحظات.
        </p>
        <p className="mt-3 text-xs text-ink-muted">الرابط صالح لمدة ساعة. تحقّق من مجلد الرسائل غير المرغوبة عند الحاجة.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">بريدك الإلكتروني</label>
        <input
          className="input"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <p className="mt-1.5 text-xs text-ink-muted">استخدم البريد نفسه الذي اشتريت أو سجّلت به.</p>
      </div>
      {error && (
        <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>
      )}
      <button type="submit" disabled={!isValidEmail(email) || loading} className="btn-primary w-full">
        {loading ? <SpinnerIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
        {loading ? "جارٍ الإرسال…" : "أرسل لي رابط الدخول"}
      </button>
    </form>
  );
}
