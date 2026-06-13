import Link from "next/link";
import { BookIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-shield/10 text-shield">
        <BookIcon className="h-10 w-10" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">الصفحة غير موجودة</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        ربما حُذف الكتاب أو تغيّر الرابط. تصفّح المكتبة للعثور على ما تبحث عنه.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className="btn-dark">الصفحة الرئيسية</Link>
        <Link href="/books" className="btn-primary">تصفّح المكتبة</Link>
      </div>
    </div>
  );
}
