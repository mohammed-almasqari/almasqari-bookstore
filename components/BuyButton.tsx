"use client";

import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { CheckIcon, DownloadIcon, LockIcon, MailIcon, SpinnerIcon } from "./icons";

type Props = {
  bookId: string;
  title: string;
  amount: string; // "9.90"
  currency: string;
  clientId: string;
  priceLabel: string;
};

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function BuyButton({ bookId, title, amount, currency, clientId, priceLabel }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ downloadUrl: string } | null>(null);

  const formOk = name.trim().length >= 2 && isValidEmail(email);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
        لم تُضبط بوابة الدفع بعد. أضف <span dir="ltr" className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</span> في ملف البيئة لتفعيل الشراء.
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-safe/30 bg-safe/5 p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-safe text-white">
          <CheckIcon className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h3 className="mt-4 font-display text-xl font-extrabold text-ink">تم الشراء بنجاح!</h3>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-ink-soft">
          <MailIcon className="h-4 w-4" /> أرسلنا الإيصال ورابط التحميل إلى بريدك.
        </p>
        <a href={done.downloadUrl} className="btn-safe mt-5 w-full" target="_blank" rel="noopener noreferrer">
          <DownloadIcon className="h-5 w-5" /> تحميل «{title}» الآن
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div>
          <label className="label">الاسم</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="اسمك الكامل"
          />
        </div>
        <div>
          <label className="label">البريد الإلكتروني (لاستلام الكتاب)</label>
          <input
            className="input"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="you@example.com"
          />
        </div>
        {touched && !formOk && (
          <p className="text-sm font-bold text-alert">أدخل اسمًا صحيحًا وبريدًا إلكترونيًا صالحًا للمتابعة.</p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-alert/30 bg-alert/5 p-3 text-sm font-bold text-alert">{error}</div>
      )}

      {processing && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-ink-muted">
          <SpinnerIcon className="h-5 w-5" /> جارٍ تأكيد الدفع وتجهيز كتابك…
        </div>
      )}

      <div className={!formOk || processing ? "pointer-events-none opacity-50" : ""}>
        <PayPalScriptProvider
          options={{ clientId, currency, intent: "capture", components: "buttons" }}
        >
          <PayPalButtons
            style={{ layout: "vertical", shape: "pill", color: "gold", label: "pay", height: 48 }}
            forceReRender={[amount, currency, formOk]}
            disabled={!formOk || processing}
            createOrder={async () => {
              setError(null);
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookId, name, email }),
              });
              const data = await res.json();
              if (!res.ok || !data.paypalOrderId) {
                setError(data.error || "تعذّر بدء عملية الدفع.");
                throw new Error(data.error || "create order failed");
              }
              return data.paypalOrderId as string;
            }}
            onApprove={async (data) => {
              setProcessing(true);
              setError(null);
              try {
                const res = await fetch("/api/checkout/capture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paypalOrderId: data.orderID, name, email }),
                });
                const out = await res.json();
                if (!res.ok || !out.ok) {
                  setError(out.error || "تعذّر إتمام الدفع. لم يُخصم أي مبلغ غالبًا.");
                  return;
                }
                setDone({ downloadUrl: out.downloadUrl });
              } catch {
                setError("حدث خطأ في الشبكة أثناء تأكيد الدفع.");
              } finally {
                setProcessing(false);
              }
            }}
            onError={() => setError("حدث خطأ في بوابة PayPal. حاول مرة أخرى.")}
          />
        </PayPalScriptProvider>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
        <LockIcon className="h-3.5 w-3.5" /> دفع آمن عبر PayPal — لا نحفظ بيانات بطاقتك. السعر: {priceLabel}
      </p>
    </div>
  );
}
