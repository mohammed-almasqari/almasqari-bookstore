"use client";

import { useState } from "react";
import { SpinnerIcon, CheckIcon, CartIcon, MailIcon, LockIcon, ChartIcon } from "@/components/icons";

export type AdminSettings = {
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalEnv: string;
  paypalSecretSet: boolean;
  bankEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankIban: string;
  bankAccountNumber: string;
  bankSwift: string;
  bankInstructions: string;
  resendKeySet: boolean;
  emailFrom: string;
  emailReplyTo: string;
  gaId: string;
  pixelId: string;
};

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-sand-200 bg-sand-50 p-3 text-right">
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

function Instructions({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-steel/20 bg-steel/5 p-4 text-sm leading-7 text-ink-soft">
      <div className="mb-1 font-bold text-steel">{title}</div>
      {children}
    </div>
  );
}

export default function SettingsForms({ initial }: { initial: AdminSettings }) {
  const [f, setF] = useState({
    paypalEnabled: initial.paypalEnabled,
    paypalClientId: initial.paypalClientId,
    paypalClientSecret: "",
    paypalEnv: initial.paypalEnv || "sandbox",
    bankEnabled: initial.bankEnabled,
    bankName: initial.bankName,
    bankAccountName: initial.bankAccountName,
    bankIban: initial.bankIban,
    bankAccountNumber: initial.bankAccountNumber,
    bankSwift: initial.bankSwift,
    bankInstructions: initial.bankInstructions,
    resendApiKey: "",
    emailFrom: initial.emailFrom,
    emailReplyTo: initial.emailReplyTo,
    gaId: initial.gaId,
    pixelId: initial.pixelId,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ppTesting, setPpTesting] = useState(false);
  const [ppMsg, setPpMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const upd = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

  async function testPaypal() {
    setPpTesting(true); setPpMsg(null);
    try {
      const res = await fetch("/api/admin/test-paypal", { method: "POST" });
      const d = await res.json();
      if (d.ok) setPpMsg({ ok: true, text: `نجح الاتصال بـ PayPal (${d.env === "live" ? "مباشر" : "تجريبي"}) ✓ المفاتيح صحيحة.` });
      else setPpMsg({ ok: false, text: d.error || "فشل الاتصال." });
    } catch {
      setPpMsg({ ok: false, text: "حدث خطأ في الشبكة." });
    } finally {
      setPpTesting(false);
    }
  }

  async function testEmail() {
    setTesting(true); setTestMsg(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo }),
      });
      const d = await res.json();
      if (d.ok) setTestMsg({ ok: true, text: `أُرسلت رسالة اختبار إلى ${d.to} بنجاح ✓ تحقّق من البريد.` });
      else setTestMsg({ ok: false, text: d.error || "فشل الإرسال." });
    } catch {
      setTestMsg({ ok: false, text: "حدث خطأ في الشبكة." });
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    setLoading(true); setError(null); setDone(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "تعذّر الحفظ."); return; }
      setDone(true);
      setF((s) => ({ ...s, paypalClientSecret: "", resendApiKey: "" }));
      setTimeout(() => setDone(false), 3500);
    } catch {
      setError("حدث خطأ في الشبكة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* PayPal */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-shield/10 text-guard"><CartIcon className="h-5 w-5" /></span>
          <h2 className="font-display text-lg font-extrabold text-ink">الدفع عبر PayPal</h2>
        </div>
        <div className="space-y-4">
          <Switch checked={f.paypalEnabled} onChange={(v) => upd("paypalEnabled", v)} label="تفعيل الدفع عبر PayPal" hint="يظهر زر PayPal في صفحات الكتب المدفوعة" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Client ID</label>
              <input className="input font-mono text-sm" dir="ltr" value={f.paypalClientId} onChange={(e) => upd("paypalClientId", e.target.value)} placeholder="AeA1Q..." />
            </div>
            <div>
              <label className="label">Secret {initial.paypalSecretSet && <span className="text-safe">(مضبوط — اتركه فارغًا للإبقاء)</span>}</label>
              <input className="input font-mono text-sm" type="password" dir="ltr" value={f.paypalClientSecret} onChange={(e) => upd("paypalClientSecret", e.target.value)} placeholder={initial.paypalSecretSet ? "••••••••" : "EL1t..."} />
            </div>
          </div>
          <div>
            <label className="label">البيئة</label>
            <select className="input" value={f.paypalEnv} onChange={(e) => upd("paypalEnv", e.target.value)}>
              <option value="sandbox">تجريبي (Sandbox) — للاختبار</option>
              <option value="live">مباشر (Live) — للبيع الحقيقي</option>
            </select>
          </div>
          <Instructions title="كيف تحصل على مفاتيح PayPal؟">
            <ol className="list-inside list-decimal space-y-1">
              <li>ادخل <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="font-bold text-steel underline">لوحة مطوّري PayPal</a> وسجّل الدخول.</li>
              <li>أنشئ تطبيقًا (App) — اختر Sandbox للتجربة أو Live للإنتاج.</li>
              <li>انسخ <b>Client ID</b> و <b>Secret</b> والصقهما أعلاه.</li>
              <li>فعّل الزر واحفظ — وسيظهر الدفع فورًا في صفحات الكتب المدفوعة.</li>
            </ol>
          </Instructions>

          <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <div className="mb-2 text-sm font-bold text-ink">اختبار الاتصال بـ PayPal</div>
            <p className="mb-3 text-xs text-ink-muted">احفظ المفاتيح أولًا، ثم اضغط للتأكد من صحتها ومطابقتها للبيئة المختارة.</p>
            <button type="button" onClick={testPaypal} disabled={ppTesting} className="btn-ghost h-11">
              {ppTesting ? <SpinnerIcon className="h-5 w-5" /> : <CartIcon className="h-5 w-5" />}
              اختبار الاتصال
            </button>
            {ppMsg && (
              <div className={`mt-3 rounded-lg p-3 text-sm font-bold leading-7 ${ppMsg.ok ? "bg-safe/10 text-safe" : "bg-alert/10 text-alert"}`}>
                {ppMsg.text}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* تحويل بنكي */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-steel/10 text-steel"><LockIcon className="h-5 w-5" /></span>
          <h2 className="font-display text-lg font-extrabold text-ink">الدفع بتحويل بنكي</h2>
        </div>
        <div className="space-y-4">
          <Switch checked={f.bankEnabled} onChange={(v) => upd("bankEnabled", v)} label="تفعيل التحويل البنكي" hint="يظهر خيار التحويل البنكي مع تفاصيل حسابك" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">اسم البنك</label><input className="input" value={f.bankName} onChange={(e) => upd("bankName", e.target.value)} placeholder="مثال: بنك مسقط" /></div>
            <div><label className="label">اسم صاحب الحساب</label><input className="input" value={f.bankAccountName} onChange={(e) => upd("bankAccountName", e.target.value)} placeholder="محمد المسقري" /></div>
            <div><label className="label">رقم الآيبان (IBAN)</label><input className="input font-mono text-sm" dir="ltr" value={f.bankIban} onChange={(e) => upd("bankIban", e.target.value)} placeholder="OM.. .... ...." /></div>
            <div><label className="label">رقم الحساب</label><input className="input font-mono text-sm" dir="ltr" value={f.bankAccountNumber} onChange={(e) => upd("bankAccountNumber", e.target.value)} /></div>
            <div><label className="label">السويفت (SWIFT/BIC)</label><input className="input font-mono text-sm" dir="ltr" value={f.bankSwift} onChange={(e) => upd("bankSwift", e.target.value)} /></div>
          </div>
          <div>
            <label className="label">تعليمات إضافية للعميل</label>
            <textarea className="input min-h-[80px]" value={f.bankInstructions} onChange={(e) => upd("bankInstructions", e.target.value)} placeholder="مثال: بعد التحويل أرسل صورة الإيصال على واتساب 9xxxxxxx، وسنرسل الكتاب خلال ساعات." />
          </div>
          <Instructions title="كيف يعمل التحويل البنكي؟">
            يرى العميل تفاصيل حسابك وزرًا لتأكيد التحويل، فيُنشأ <b>طلب معلّق</b>. تراجعه أنت من صفحة <b>الطلبات</b>، وعند تأكيد استلام المبلغ تضغط «تأكيد» فيصل الكتاب للعميل تلقائيًا بالبريد.
          </Instructions>
        </div>
      </section>

      {/* Resend */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-safe/10 text-safe"><MailIcon className="h-5 w-5" /></span>
          <h2 className="font-display text-lg font-extrabold text-ink">البريد الإلكتروني (Resend)</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">مفتاح Resend API {initial.resendKeySet && <span className="text-safe">(مضبوط — اتركه فارغًا للإبقاء)</span>}</label>
            <input className="input font-mono text-sm" type="password" dir="ltr" value={f.resendApiKey} onChange={(e) => upd("resendApiKey", e.target.value)} placeholder={initial.resendKeySet ? "••••••••" : "re_..."} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">المرسِل (From)</label><input className="input text-sm" dir="ltr" value={f.emailFrom} onChange={(e) => upd("emailFrom", e.target.value)} placeholder="مكتبة محمد المسقري <no-reply@dalilai.net>" /></div>
            <div><label className="label">الرد إلى (Reply-To)</label><input className="input text-sm" dir="ltr" value={f.emailReplyTo} onChange={(e) => upd("emailReplyTo", e.target.value)} placeholder="author@dalilai.net" /></div>
          </div>
          <Instructions title="كيف تربط Resend؟">
            <ol className="list-inside list-decimal space-y-1">
              <li>أنشئ مفتاحًا من <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="font-bold text-steel underline">resend.com/api-keys</a> (يبدأ بـ re_).</li>
              <li>وثّق نطاق الإرسال في Resend (Domains) بإضافة سجلات DNS في Hostinger.</li>
              <li>اجعل «المرسِل» على نطاقك الموثّق، ثم احفظ.</li>
              <li>عندها تُرسل رسائل التأكيد والتسليم والإيصال تلقائيًا.</li>
            </ol>
          </Instructions>

          {/* اختبار الإرسال */}
          <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <div className="mb-2 text-sm font-bold text-ink">اختبار الإرسال</div>
            <p className="mb-3 text-xs text-ink-muted">احفظ المفتاح أولًا، ثم أرسل رسالة اختبار. (مع المرسِل التجريبي onboarding@resend.dev لا يقبل Resend الإرسال إلا إلى بريد حسابك في Resend.)</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1" style={{ minWidth: 200 }}>
                <label className="label">أرسل إلى (اتركه فارغًا لبريد المدير)</label>
                <input className="input" type="email" dir="ltr" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" />
              </div>
              <button type="button" onClick={testEmail} disabled={testing} className="btn-ghost h-12">
                {testing ? <SpinnerIcon className="h-5 w-5" /> : <MailIcon className="h-5 w-5" />}
                اختبار
              </button>
            </div>
            {testMsg && (
              <div className={`mt-3 rounded-lg p-3 text-sm font-bold ${testMsg.ok ? "bg-safe/10 text-safe" : "bg-alert/10 text-alert"}`}>
                {testMsg.text}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* التحليلات */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink/5 text-ink"><ChartIcon className="h-5 w-5" /></span>
          <h2 className="font-display text-lg font-extrabold text-ink">التحليلات</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Google Analytics (Measurement ID)</label>
            <input className="input font-mono text-sm" dir="ltr" value={f.gaId} onChange={(e) => upd("gaId", e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <label className="label">Meta Pixel ID</label>
            <input className="input font-mono text-sm" dir="ltr" value={f.pixelId} onChange={(e) => upd("pixelId", e.target.value)} placeholder="123456789012345" />
          </div>
        </div>
        <Instructions title="كيف تربط التحليلات؟">
          من <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="font-bold text-steel underline">Google Analytics</a> أنشئ Property واحصل على معرّف القياس (يبدأ بـ G-). وللإعلانات، انسخ Meta Pixel ID من مدير أحداث فيسبوك. اتركها فارغة لتعطيل التتبّع.
        </Instructions>
      </section>

      {/* حفظ */}
      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-sand-200 bg-white/95 p-4 shadow-card-hover backdrop-blur">
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
          {loading ? "جارٍ الحفظ…" : "حفظ كل الإعدادات"}
        </button>
        {done && <span className="flex items-center gap-1.5 text-sm font-bold text-safe"><CheckIcon className="h-4 w-4" /> حُفظت الإعدادات بنجاح</span>}
        {error && <span className="text-sm font-bold text-alert">{error}</span>}
      </div>
    </div>
  );
}
