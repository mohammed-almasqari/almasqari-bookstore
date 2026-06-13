"use client";

import { useState } from "react";
import { CheckIcon } from "./icons";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { label: "واتساب", href: `https://wa.me/?text=${t}%20${u}`, cls: "bg-[#25D366] text-white" },
    { label: "تيليجرام", href: `https://t.me/share/url?url=${u}&text=${t}`, cls: "bg-[#0088cc] text-white" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, cls: "bg-ink text-white" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-ink-muted">شارك:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${l.cls}`}
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sand-200 bg-white px-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
      >
        {copied ? <><CheckIcon className="h-4 w-4 text-safe" /> نُسخ</> : "نسخ الرابط"}
      </button>
    </div>
  );
}
