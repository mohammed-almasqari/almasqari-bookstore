import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-sand-200 bg-ink text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="[&_a]:!text-white">
            <Logo light />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-8 text-white/70">
            مكتبة رقمية للكاتب محمد المسقري، متخصصة في كتب الأمن الرقمي والحماية من الاحتيال،
            مع تحميل فوري وآمن بعد الشراء.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-extrabold text-shield-light">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li><Link href="/books" className="hover:text-shield-light">المكتبة الكاملة</Link></li>
            <li><Link href="/free" className="hover:text-shield-light">الكتب المجانية</Link></li>
            <li><Link href="/#about" className="hover:text-shield-light">عن المؤلف</Link></li>
            <li><Link href="/admin" className="hover:text-shield-light">لوحة التحكم</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-extrabold text-shield-light">الدفع والأمان</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li>الدفع الآمن عبر PayPal</li>
            <li>روابط تحميل مشفّرة ومؤقتة</li>
            <li>تسليم فوري بالبريد الإلكتروني</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/55 sm:flex-row">
          <span>© {year} محمد المسقري — جميع الحقوق محفوظة.</span>
          <span>صُمّم بعناية لقرّاء العربية 🌿</span>
        </div>
      </div>
    </footer>
  );
}
