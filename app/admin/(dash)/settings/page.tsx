import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import PasswordForm from "@/components/admin/PasswordForm";
import { isPayPalConfigured } from "@/lib/paypal";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const session = await getSession();

  const info: [string, string][] = [
    ["اسم المتجر", env.siteName],
    ["رابط الموقع", env.siteUrl],
    ["عملة العرض", env.currency],
    ["بريد الإرسال", env.resend.from],
    ["وضع PayPal", env.paypal.env === "live" ? "مباشر (Live)" : "تجريبي (Sandbox)"],
  ];

  const status = [
    { label: "الدفع (PayPal)", ok: isPayPalConfigured() },
    { label: "البريد (Resend)", ok: !!env.resend.apiKey },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">الإعدادات</h1>
        <p className="mt-1 text-sm text-ink-muted">معلومات المتجر وحساب المدير.</p>
      </div>

      {/* حساب المدير */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-extrabold text-ink">حساب المدير</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {session?.name} · <span dir="ltr">{session?.email}</span>
        </p>
        <div className="mt-5 border-t border-sand-100 pt-5">
          <h3 className="mb-3 font-bold text-ink-soft">تغيير كلمة المرور</h3>
          <PasswordForm />
        </div>
      </section>

      {/* معلومات المتجر */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-extrabold text-ink">معلومات المتجر</h2>
        <p className="mt-1 text-sm text-ink-muted">تُضبط هذه القيم عبر متغيّرات البيئة في Coolify.</p>
        <dl className="mt-4 divide-y divide-sand-100">
          {info.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-ink-muted">{k}</dt>
              <dd dir="auto" className="text-left font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-sand-100 pt-5">
          {status.map((s) => (
            <span
              key={s.label}
              className={`badge ${s.ok ? "bg-safe/10 text-safe" : "bg-amber-100 text-amber-700"}`}
            >
              {s.ok ? "مُفعّل" : "غير مهيّأ"} · {s.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
