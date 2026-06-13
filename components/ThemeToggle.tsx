"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

/**
 * زر تبديل الوضع الليلي/الفاتح. يضيف/يزيل صنف dark على <html> ويحفظ التفضيل.
 * تطبيق التفضيل المبكر يحدث عبر سكربت في layout لمنع وميض اللون.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* تجاهل */
    }
  }

  const label = dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي";

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={
        className ??
        "grid h-10 w-10 place-items-center rounded-xl border border-sand-200 bg-surface text-ink-soft transition-colors hover:text-shield"
      }
    >
      {mounted && dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
