import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { getSettingsForAdmin } from "@/lib/settings";
import PasswordForm from "@/components/admin/PasswordForm";
import SettingsForms from "@/components/admin/SettingsForms";
import EmailDomainSetup from "@/components/admin/EmailDomainSetup";

export const dynamic = "force-dynamic";
export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const [session, settings] = await Promise.all([getSession(), getSettingsForAdmin()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">الإعدادات</h1>
        <p className="mt-1 text-sm text-ink-muted">إعدادات الدفع والبريد وحساب المدير ومعلومات المتجر.</p>
      </div>

      {/* الدفع والبريد */}
      <SettingsForms initial={settings} />

      {/* توثيق نطاق البريد */}
      <EmailDomainSetup />

      {/* حساب المدير */}
      <section className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
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
      <section className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
        <h2 className="font-display text-lg font-extrabold text-ink">معلومات المتجر</h2>
        <dl className="mt-4 divide-y divide-sand-100">
          {([
            ["اسم المتجر", env.siteName],
            ["رابط الموقع", env.siteUrl],
            ["عملة العرض", env.currency],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-ink-muted">{k}</dt>
              <dd dir="auto" className="text-left font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
