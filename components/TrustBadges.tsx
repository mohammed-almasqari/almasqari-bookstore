import { DownloadIcon, LockIcon, ShieldIcon, MailIcon } from "./icons";

const items = [
  { icon: DownloadIcon, title: "تحميل فوري", desc: "رابطك يصل مباشرة بعد الدفع", color: "text-steel", bg: "bg-steel/10" },
  { icon: LockIcon, title: "دفع آمن", desc: "PayPal أو تحويل بنكي موثّق", color: "text-safe", bg: "bg-safe/10" },
  { icon: ShieldIcon, title: "جودة مضمونة", desc: "محتوى أصلي بصيغة PDF", color: "text-shield", bg: "bg-shield/10" },
  { icon: MailIcon, title: "دعم متواصل", desc: "نجيبك على أي استفسار", color: "text-guard", bg: "bg-guard/10" },
];

export default function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 rounded-[24px] border border-sand-200 bg-surface p-6 shadow-card sm:gap-6 sm:p-8 lg:grid-cols-4 ${className}`}>
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-right">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${it.bg} ${it.color}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-sm font-extrabold text-ink">{it.title}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{it.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
