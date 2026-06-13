import Link from "next/link";
import BookForm from "@/components/admin/BookForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "إضافة كتاب" };

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/books" className="text-sm font-bold text-shield hover:underline">← العودة للكتب</Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">إضافة كتاب جديد</h1>
        <p className="mt-1 text-sm text-ink-muted">املأ بيانات الكتاب وارفع الملف والغلاف.</p>
      </div>
      <BookForm mode="create" />
    </div>
  );
}
