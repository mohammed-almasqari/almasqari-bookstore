"use client";

import { useState } from "react";
import BuyButton from "./BuyButton";
import { CartIcon, LockIcon, CheckIcon, SpinnerIcon, MailIcon } from "./icons";

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

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
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

function BankFlow({ bookId, title, priceLabel, bank }: { bookId: string; title: string; priceLabel: string; bank: BankInfo }) {
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
        body: JSON.stringify({ bookId, name, email, reference }),
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

  if (methods.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
        طرق الدفع غير مفعّلة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع المتجر.
      </div>
    );
  }

  return (
    <div>
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
        <BuyButton bookId={props.bookId} title={props.title} amount={props.amount} currency={props.currency} clientId={props.paypalClientId} priceLabel={props.priceLabel} />
      )}
      {tab === "bank" && props.bankEnabled && (
        <BankFlow bookId={props.bookId} title={props.title} priceLabel={props.priceLabel} bank={props.bank} />
      )}
    </div>
  );
}
