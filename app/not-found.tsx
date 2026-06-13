import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "Tajawal, Arial, sans-serif", background: "#FBF7F0", color: "#1E1B2E" }}>
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", textAlign: "center", padding: 24 }}>
          <div>
            <div style={{ fontSize: 56 }}>📕</div>
            <h1 style={{ fontSize: 26, margin: "10px 0" }}>الصفحة غير موجودة</h1>
            <p style={{ color: "#4B475F", marginBottom: 18 }}>الرابط الذي طلبته غير متاح.</p>
            <Link href="/" style={{ background: "#D97706", color: "#fff", padding: "12px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
