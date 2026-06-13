"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, SpinnerIcon } from "@/components/icons";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function remove() {
    if (!window.confirm(`حذف مقال «${title}»؟`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh(); else alert("تعذّر الحذف.");
  }
  return (
    <button onClick={remove} disabled={loading} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-alert hover:text-alert" title="حذف">
      {loading ? <SpinnerIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
    </button>
  );
}
