"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "./icons";

const KEY = "wishlist";

export function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function WishlistButton({ bookId, floating = true }: { bookId: string; floating?: boolean }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readWishlist().includes(bookId));
  }, [bookId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const cur = readWishlist();
    const next = cur.includes(bookId) ? cur.filter((x) => x !== bookId) : [...cur, bookId];
    localStorage.setItem(KEY, JSON.stringify(next));
    setOn(next.includes(bookId));
    window.dispatchEvent(new Event("wishlist-changed"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
      title={on ? "في المفضلة" : "أضف إلى المفضلة"}
      className={
        floating
          ? "grid h-9 w-9 place-items-center rounded-full bg-white/90 text-alert shadow-sm backdrop-blur transition-transform hover:scale-110"
          : "inline-flex h-10 items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 font-bold text-ink"
      }
    >
      <HeartIcon className="h-5 w-5" fill={on ? "currentColor" : "none"} />
      {!floating && (on ? "في المفضلة" : "أضف للمفضلة")}
    </button>
  );
}
