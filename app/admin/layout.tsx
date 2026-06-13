// تخطيط جذر لقسم لوحة التحكم — يمرّر المحتوى فقط؛ الواجهة الفعلية في مجموعة (dash)
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F4F1EB]">{children}</div>;
}
