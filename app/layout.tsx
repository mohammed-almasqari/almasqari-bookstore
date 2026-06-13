import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.siteName} — كتب رقمية للحماية والمعرفة`,
    template: `%s — ${env.siteName}`,
  },
  description:
    "متجر الكتب الرقمية للكاتب محمد المسقري. كتب في الأمن الرقمي والحماية من الاحتيال، تحميل فوري بعد الشراء، وكتب مجانية بالبريد.",
  keywords: ["كتب رقمية", "محمد المسقري", "الأمن الرقمي", "الاحتيال", "كتب عربية"],
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: env.siteName,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
