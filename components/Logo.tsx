import Link from "next/link";
import { env } from "@/lib/env";
import { ShieldIcon } from "./icons";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-shield text-white shadow-glow transition-transform group-hover:scale-105">
        <ShieldIcon className="h-6 w-6" strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-display text-lg font-extrabold ${light ? "text-white" : "text-ink"}`}>
          {env.siteName}
        </span>
        <span className={`text-[11px] font-medium ${light ? "text-white/70" : "text-ink-muted"}`}>
          كتب رقمية تحميك وتثري معرفتك
        </span>
      </span>
    </Link>
  );
}
