"use client";

import { useState } from "react";
import { LockIcon, SpinnerIcon, CheckIcon } from "@/components/icons";

export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
    if (next !== confirm) return setError("كلمتا المرور غير متطابقتين.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "تعذّر تغيير كلمة المرور.");
        return;
      }
      setDone(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {done && (
        <div className="flex items-center gap-2 rounded-xl border border-safe/30 bg-safe/5 p-3 text-sm font-bold text-safe">
          <CheckIcon className="h-4 w-4" /> تم تغيير كلمة المرور بنجاح.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>
      )}
      <div>
        <label className="label">كلمة المرور الحالية</label>
        <input className="input" type="password" dir="ltr" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">كلمة المرور الجديدة</label>
          <input className="input" type="password" dir="ltr" value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
        <div>
          <label className="label">تأكيد كلمة المرور</label>
          <input className="input" type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-dark">
        {loading ? <SpinnerIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
        {loading ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
      </button>
    </form>
  );
}
