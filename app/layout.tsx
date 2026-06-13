import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { env } from "@/lib/env";
import Analytics from "@/components/Analytics";
import RefCapture from "@/components/RefCapture";

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
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: env.siteName,
    url: env.siteUrl,
    logo: `${env.siteUrl.replace(/\/$/, "")}/icon.png`,
    description: "مكتبة رقمية عربية في الأمن الرقمي والحماية من الاحتيال للكاتب محمد المسقري.",
    founder: { "@type": "Person", name: "محمد المسقري" },
  };

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {children}
        <RefCapture />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
