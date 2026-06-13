"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShieldIcon,
  ChartIcon,
  BookIcon,
  ReceiptIcon,
  UsersIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  SettingsIcon,
  GridIcon,
  StarIcon,
  EditIcon,
  MailIcon,
  TagIcon,
  ShareIcon,
} from "@/components/icons";

const nav = [
  { href: "/admin", label: "لوحة المعلومات", icon: ChartIcon, exact: true },
  { href: "/admin/books", label: "الكتب", icon: BookIcon },
  { href: "/admin/series", label: "السلاسل", icon: GridIcon },
  { href: "/admin/blog", label: "المدونة", icon: EditIcon },
  { href: "/admin/orders", label: "الطلبات", icon: ReceiptIcon },
  { href: "/admin/coupons", label: "كوبونات الخصم", icon: TagIcon },
  { href: "/admin/referrals", label: "برنامج الإحالة", icon: ShareIcon },
  { href: "/admin/reviews", label: "التقييمات", icon: StarIcon },
  { href: "/admin/subscribers", label: "المشتركون", icon: UsersIcon },
  { href: "/admin/newsletter", label: "النشرة البريدية", icon: MailIcon },
  { href: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
];

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-shield text-white">
          <ShieldIcon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <div className="font-display text-base font-extrabold text-white">لوحة التحكم</div>
          <div className="text-[11px] text-white/55">مكتبة محمد المسقري</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((n) => {
          const Icon = n.icon;
          const on = active(n.href, n.exact);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                on ? "bg-shield text-white shadow-glow" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <BookIcon className="h-5 w-5" /> زيارة المتجر
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/70 hover:bg-alert/20 hover:text-white"
        >
          <LogoutIcon className="h-5 w-5" /> تسجيل الخروج
        </button>
        <div className="px-4 pt-2 text-[11px] text-white/40">مسجّل: {name}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* شريط علوي للجوال */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-soft bg-ink px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-white">
          <ShieldIcon className="h-6 w-6 text-shield-light" />
          <span className="font-display font-extrabold">لوحة التحكم</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white" aria-label="القائمة">
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* الشريط الجانبي الثابت */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 bg-ink lg:block">{content}</aside>

      {/* درج الجوال */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-72 bg-ink">
            <button onClick={() => setOpen(false)} className="absolute left-3 top-4 text-white/70" aria-label="إغلاق">
              <CloseIcon className="h-6 w-6" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
