/**
 * وصول مركزي لمتغيرات البيئة مع قيم افتراضية آمنة.
 * القيم الحساسة تُقرأ على الخادم فقط.
 */

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "مكتبة محمد المسقري",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",

  authSecret: process.env.AUTH_SECRET || "dev-insecure-secret-change-me",

  paypal: {
    env: process.env.PAYPAL_ENV || "sandbox",
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "مكتبة <onboarding@resend.dev>",
    replyTo: process.env.EMAIL_REPLY_TO || "",
  },

  uploadDir: process.env.UPLOAD_DIR || "/app/uploads",
};

// عنوان عام مطلق لرابط ما
export function absoluteUrl(path: string): string {
  const base = env.siteUrl.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
