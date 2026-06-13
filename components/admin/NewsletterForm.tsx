"use client";

import { useState } from "react";
import { MailIcon, SpinnerIcon, CheckIcon } from "@/components/icons";

export default function NewsletterForm({ count }: { count: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 2 || body.trim().length < 5 || loading) return;
    if (!window.confirm(`إرسال النشرة إلى ${count} مشترك؟`)) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const d = await res.json();
      if (!res.ok) {
        setResult({ ok: false, text: d.error || "تعذّر الإرسال." });
        return;
      }
      setResult({ ok: true, text: `أُرسلت النشرة إلى ${d.sent} من ${d.total} مشترك.` });
      setSubject("");
      setBody("");
    } catch {
      setResult({ ok: false, text: "حدث خطأ في الشبكة." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={send} className="rounded-2xl border border-sand-200 bg-surface p-6 shadow-card">
      <p className="mb-4 text-sm text-ink-muted">تُرسل إلى {count} مشترك مؤكَّد وموافق على التحديثات، بتصميم بريد المتجر.</p>
      <div className="space-y-4">
        <div>
          <label className="label">عنوان الرسالة</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: كتاب جديد + نصيحة الأسبوع" />
        </div>
        <div>
          <label className="label">نص الرسالة</label>
          <textarea className="input min-h-[200px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="اكتب رسالتك… سطر فارغ يبدأ فقرة جديدة." />
        </div>
        {result && (
          <div className={`rounded-xl p-3 text-sm font-bold ${result.ok ? "bg-safe/10 text-safe" : "bg-alert/10 text-alert"}`}>
            {result.ok && <CheckIcon className="ml-1 inline h-4 w-4" />}{result.text}
          </div>
        )}
        <button type="submit" disabled={loading || count === 0} className="btn-primary">
          {loading ? <SpinnerIcon className="h-5 w-5" /> : <MailIcon className="h-5 w-5" />}
          {loading ? "جارٍ الإرسال…" : "إرسال النشرة"}
        </button>
      </div>
    </form>
  );
}
