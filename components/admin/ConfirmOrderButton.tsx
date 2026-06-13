"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, SpinnerIcon } from "@/components/icons";

export default function ConfirmOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!window.confirm("تأكيد استلام التحويل البنكي وإرسال الكتاب للعميل؟")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/confirm`, { method: "POST" });
      if (res.ok) router.refresh();
      else alert("تعذّر تأكيد الطلب.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={confirm} disabled={loading} className="btn-safe h-9 px-3 text-xs">
      {loading ? <SpinnerIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
      تأكيد الدفع
    </button>
  );
}
