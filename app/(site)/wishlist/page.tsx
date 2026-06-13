"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCard, { type BookCardData } from "@/components/BookCard";
import { readWishlist } from "@/components/WishlistButton";
import { HeartIcon, SpinnerIcon } from "@/components/icons";

export default function WishlistPage() {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const ids = readWishlist();
    if (ids.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/books/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const d = await res.json();
      // رتّب حسب ترتيب الإضافة المحفوظ
      const order = new Map(ids.map((id, i) => [id, i]));
      const list: BookCardData[] = (d.books || []).sort(
        (a: BookCardData, b: BookCardData) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );
      setBooks(list);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("wishlist-changed", onChange);
    return () => window.removeEventListener("wishlist-changed", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-x py-12">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-alert/10 text-alert">
          <HeartIcon className="h-7 w-7" fill="currentColor" />
        </span>
        <h1 className="mt-4 section-title">المفضلة</h1>
        <p className="mt-2 text-ink-muted">الكتب التي حفظتها للرجوع إليها لاحقًا.</p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center text-ink-muted"><SpinnerIcon className="h-7 w-7" /></div>
      ) : books.length === 0 ? (
        <div className="card mx-auto mt-10 max-w-md p-12 text-center">
          <p className="text-ink-muted">قائمة المفضلة فارغة. اضغط القلب على أي كتاب لإضافته.</p>
          <Link href="/books" className="btn-primary mt-5 inline-flex">تصفّح المكتبة</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
