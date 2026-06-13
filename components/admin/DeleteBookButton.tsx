"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, SpinnerIcon } from "@/components/icons";

export default function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm(`حذف كتاب «${title}» نهائيًا؟ سيُحذف الملف وكل الطلبات المرتبطة به.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("تعذّر حذف الكتاب.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted transition-colors hover:border-alert hover:bg-alert/5 hover:text-alert"
      title="حذف"
    >
      {loading ? <SpinnerIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
    </button>
  );
}
