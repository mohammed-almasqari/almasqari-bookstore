"use client";

import { useEffect } from "react";

/**
 * يلتقط رمز الإحالة من رابط ?ref=CODE ويحفظه محليًا ليُرفق تلقائيًا عند الشراء.
 * لا يعرض شيئًا.
 */
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) {
        const clean = ref.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
        if (clean) localStorage.setItem("almasqari_ref", clean);
      }
    } catch {
      /* تجاهل */
    }
  }, []);
  return null;
}
