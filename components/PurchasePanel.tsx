"use client";

import { useEffect, useState } from "react";
import BuyButton from "./BuyButton";
import { CartIcon, LockIcon, CheckIcon, SpinnerIcon, MailIcon, TagIcon, CloseIcon } from "./icons";

type BankInfo = {
  name: string;
  accountName: string;
  iban: string;
  accountNumber: string;
  swift: string;
  instructions: string;
};

type Props = {
  bookId: string;
  title: string;
  amount: string;
  currency: string;
  priceLabel: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  bankEnabled: boolean;
  bank: BankInfo;
};

type AppliedCoupon = { code: string; discountLabel: string; finalLabel: string; finalCents: number };

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

/** قراءة رمز الإحالة المحفوظ (يُلتقط من رابط ?ref= في صفحة الإحالة) */
function useReferralCode() {
  const [ref, setRef] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const v = localStorage.getItem("almasqari_ref");
      if (v) setRef(v);
    } catch {
      /* تجاهل */
    }
  }, []);
  return ref;
}

/** حقل كوبون الخصم المشترك بين طرق الدفع */
function CouponField({
  bookId,
  applied,
  onApply,
  onRemove,
}: {
  bookId: string;
  applied: AppliedCoupon | null;
  onApply: (c: AppliedCoupon) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const c = code.trim();
    if (c.length < 1 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c, bookId }),
      });
      const d = await res.json();
      if (!d.ok) {
        setError(d.error || "رمز غير صالح.");
        return;
      }
      onApply({ code: d.code, discountLabel: d.discountLabel, finalLabel: d.finalLabel, finalCents: d.finalCents });
      setCode("");
    } catch {
      setError("تعذّر التحقق من الكوبون.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-safe/30 bg-safe/5 p-3">
        <span className="flex items-center gap-2 text-sm font-bold text-safe">
          <TagIcon className="h-4 w-4" /> طُبِّق الكوبون «{applied.code}» — وفّرت {applied.discountLabel}
        </span>
        <button onClick={onRemove} className="text-ink-muted hover:text-alert" aria-label="إزالة الكوبون">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <TagIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pr-9"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            placeholder="رمز كوبون الخصم"
            dir="ltr"
          />
        </div>
        <button onClick={apply} disabled={loading || code.trim().length < 1} className="btn-ghost shrink-0 px-5 py-3">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : "تطبيق"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-bold text-alert">{error}</p>}
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sand-100 py-2 last:border-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span dir="ltr" className="select-all text-right font-mono text-sm font-bold text-ink">{value}</span>
    </div>
  );
}

function BankFlow({
  bookId,
  title,
  priceLabel,
  bank,
  coupon,
  refCode,
}: {
  bookId: string;
  title: string;
  priceLabel: string;
  bank: BankInfo;
  coupon?: string;
  refCode?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const ok = name.trim().length >= 2 && isEmail(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || loading) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/checkout/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, name, email, reference, coupon, ref: refCode }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "تعذّر إرسال الطلب."); return; }
      setDone(true);
    } catch { setError("حدث خطأ في الشبكة."); } finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-safe text-white"><CheckIcon className="h-8 w-8" strokeWidth={2.5} /></span>
        <h3 className="mt-4 font-display text-xl font-extrabold text-ink">استلمنا طلبك</h3>
        <p className="mt-2 leading-8 text-ink-soft">بعد تأكيدنا استلام التحويل، سنرسل كتاب «{title}» إلى بريدك مباشرة. شكرًا لك.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sand-200 bg-sand-50 p-4">
        <div className="mb-2 text-sm font-bold text-ink">حوّل مبلغ {priceLabel} إلى الحساب التالي:</div>
        <BankRow label="البنك" value={bank.name} />
        <BankRow label="اسم الحساب" value={bank.accountName} />
        <BankRow label="الآيبان" value={bank.iban} />
        <BankRow label="رقم الحساب" value={bank.accountNumber} />
        <BankRow label="SWIFT" value={bank.swift} />
        {bank.instructions && <p className="mt-3 text-sm leading-7 text-ink-soft">{bank.instructions}</p>}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">الاسم</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" /></div>
          <div><label className="label">البريد (لاستلام الكتاب)</label><input className="input" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </div>
        <div><label className="label">مرجع التحويل (اختياري)</label><input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="رقم العملية أو ملاحظة" /></div>
        {error && <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>}
        <button type="submit" disabled={!ok || loading} className="btn-safe w-full">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
          {loading ? "جارٍ الإرسال…" : "أرسلت التحويل — أبلغوني"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted"><MailIcon className="h-3.5 w-3.5" /> يصلك الكتاب بالبريد بعد تأكيد استلام المبلغ.</p>
      </form>
    </div>
  );
}

export default function PurchasePanel(props: Props) {
  const paypalOk = props.paypalEnabled && !!props.paypalClientId;
  const methods: ("paypal" | "bank")[] = [];
  if (paypalOk) methods.push("paypal");
  if (props.bankEnabled) methods.push("bank");

  const [tab, setTab] = useState<"paypal" | "bank">(methods[0] || "paypal");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const refCode = useReferralCode();

  // المبلغ الفعلي بعد الخصم
  const effAmount = coupon ? centsToDecimal(coupon.finalCents) : props.amount;
  const effLabel = coupon ? coupon.finalLabel : props.priceLabel;

  if (methods.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
        طرق الدفع غير مفعّلة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع المتجر.
      </div>
    );
  }

  return (
    <div>
      <CouponField bookId={props.bookId} applied={coupon} onApply={setCoupon} onRemove={() => setCoupon(null)} />

      {coupon && (
        <div className="mb-4 flex items-baseline justify-between rounded-xl bg-shield/5 px-4 py-2.5 text-sm">
          <span className="text-ink-muted line-through">{props.priceLabel}</span>
          <span className="font-display text-xl font-extrabold text-guard tnum">{effLabel}</span>
        </div>
      )}

      {methods.length > 1 && (
        <div className="mb-4 inline-flex rounded-xl border border-sand-200 bg-sand-50 p-1">
          <button onClick={() => setTab("paypal")} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${tab === "paypal" ? "bg-white text-guard shadow-sm" : "text-ink-muted"}`}>
            <CartIcon className="h-4 w-4" /> PayPal
          </button>
          <button onClick={() => setTab("bank")} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${tab === "bank" ? "bg-white text-steel shadow-sm" : "text-ink-muted"}`}>
            <LockIcon className="h-4 w-4" /> تحويل بنكي
          </button>
        </div>
      )}

      {tab === "paypal" && paypalOk && (
        <BuyButton
          key={effAmount}
          bookId={props.bookId}
          title={props.title}
          amount={effAmount}
          currency={props.currency}
          clientId={props.paypalClientId}
          priceLabel={effLabel}
          coupon={coupon?.code}
          refCode={refCode}
        />
      )}
      {tab === "bank" && props.bankEnabled && (
        <BankFlow bookId={props.bookId} title={props.title} priceLabel={effLabel} bank={props.bank} coupon={coupon?.code} refCode={refCode} />
      )}
    </div>
  );
}
