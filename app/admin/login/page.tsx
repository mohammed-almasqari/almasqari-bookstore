"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon, LockIcon, SpinnerIcon } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر تسجيل الدخول.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-ink text-shield-light shadow-card">
            <ShieldIcon className="h-9 w-9" strokeWidth={2} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">لوحة تحكم المتجر</h1>
          <p className="mt-1 text-sm text-ink-muted">سجّل دخولك لإدارة الكتب والطلبات</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-sand-200 bg-white p-7 shadow-card">
          <div className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                className="input"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@example.com"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input
                className="input"
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-dark w-full">
              {loading ? <SpinnerIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
              {loading ? "جارٍ الدخول…" : "تسجيل الدخول"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          محمي بتشفير الجلسات — هذه الصفحة للمؤلف فقط.
        </p>
      </div>
    </div>
  );
}
