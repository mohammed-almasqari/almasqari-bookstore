"use client";

import { useState } from "react";
import { SpinnerIcon, CheckIcon, MailIcon } from "@/components/icons";

type Rec = { record?: string; name: string; type: string; value: string; priority?: number; ttl?: string; status?: string };

export default function EmailDomainSetup() {
  const [domain, setDomain] = useState("dalilai.net");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ id: string; name: string; status: string; records: Rec[] } | null>(null);

  async function call(action: "create" | "verify") {
    action === "verify" ? setVerifying(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/email-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, domain, id: data?.id }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "حدث خطأ."); return; }
      setData({ id: d.id, name: d.name, status: d.status, records: d.records || [] });
    } catch { setError("خطأ في الشبكة."); } finally { setLoading(false); setVerifying(false); }
  }

  const statusColor = data?.status === "verified" ? "text-safe" : "text-amber-700";

  return (
    <section className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-safe/10 text-safe"><MailIcon className="h-5 w-5" /></span>
        <h2 className="font-display text-lg font-extrabold text-ink">توثيق نطاق البريد (للإرسال للعملاء)</h2>
      </div>
      <p className="mb-4 text-sm leading-7 text-ink-muted">
        لإرسال البريد لأي عميل (لا لبريدك فقط)، وثّق نطاقك. اضغط «جلب السجلات» وسأنشئ النطاق في Resend وأعرض لك سجلات DNS — أضِفها في Hostinger ثم اضغط «تحقّق».
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1" style={{ minWidth: 220 }}>
          <label className="label">النطاق</label>
          <input className="input font-mono text-sm" dir="ltr" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="dalilai.net" />
        </div>
        <button type="button" onClick={() => call("create")} disabled={loading} className="btn-primary h-12">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <MailIcon className="h-5 w-5" />}
          جلب السجلات
        </button>
      </div>

      {error && <div className="mt-3 rounded-lg bg-alert/10 p-3 text-sm font-bold text-alert">{error}</div>}

      {data && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm">
              النطاق: <b dir="ltr">{data.name}</b> · الحالة: <b className={statusColor}>{data.status === "verified" ? "موثّق ✓" : data.status}</b>
            </span>
            <button type="button" onClick={() => call("verify")} disabled={verifying} className="btn-safe h-9 px-4 text-sm">
              {verifying ? <SpinnerIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              تحقّق الآن
            </button>
          </div>

          <p className="mb-2 text-xs text-ink-muted">أضف هذه السجلات في Hostinger (DNS) كما هي:</p>
          <div className="overflow-x-auto rounded-xl border border-sand-200">
            <table className="w-full min-w-[640px] text-right text-xs">
              <thead className="bg-sand-50 text-ink-muted">
                <tr>
                  <th className="p-2.5 font-bold">النوع</th>
                  <th className="p-2.5 font-bold">الاسم (Name/Host)</th>
                  <th className="p-2.5 font-bold">القيمة (Value)</th>
                  <th className="p-2.5 font-bold">الأولوية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {data.records.map((r, i) => (
                  <tr key={i} className="align-top">
                    <td className="p-2.5 font-bold text-ink">{r.type}</td>
                    <td className="p-2.5"><span dir="ltr" className="select-all break-all font-mono text-ink-soft">{r.name}</span></td>
                    <td className="p-2.5"><span dir="ltr" className="select-all break-all font-mono text-ink-soft">{r.value}</span></td>
                    <td className="p-2.5 font-mono text-ink-soft">{r.priority ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.status !== "verified" && (
            <p className="mt-3 text-xs leading-6 text-ink-muted">
              بعد إضافة السجلات في Hostinger، انتظر دقائق ثم اضغط «تحقّق الآن». عند التوثيق، غيّر «المرسِل (From)» أعلاه إلى بريد على هذا النطاق (مثل no-reply@{data.name}) واحفظ.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
