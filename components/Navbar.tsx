"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { GiftIcon, MenuIcon, CloseIcon } from "./icons";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/books", label: "المكتبة" },
  { href: "/free", label: "كتب مجانية" },
  { href: "/#about", label: "عن المؤلف" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace("/#about", "/"));

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/70 bg-sand-50/80 backdrop-blur-md">
      <nav className="container-x flex h-[68px] items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-2 text-[15px] font-bold transition-colors ${
                isActive(l.href) ? "text-shield" : "text-ink-soft hover:text-shield"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/free" className="btn-primary hidden h-11 px-5 text-sm sm:inline-flex">
            <GiftIcon className="h-5 w-5" />
            احصل على كتاب مجاني
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-sand-200 bg-white text-ink md:hidden"
            aria-label="القائمة"
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-sand-200 bg-white md:hidden">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-bold text-ink-soft hover:bg-sand-50"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/free" onClick={() => setOpen(false)} className="btn-primary mt-2">
              <GiftIcon className="h-5 w-5" />
              احصل على كتاب مجاني
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
