import { Resend } from "resend";
import { getSettings } from "../settings";
import { confirmEmail, deliveryEmail, receiptEmail, loginLinkEmail, newsletterEmail } from "./templates";

/**
 * إرسال البريد عبر Resend. تُقرأ المفاتيح والمرسِل من إعدادات لوحة التحكم
 * (قاعدة البيانات) مع التراجع لمتغيّرات البيئة. إن لم يُضبط المفتاح تُسجَّل في السجل بدل الفشل.
 */

async function send(to: string, subject: string, html: string) {
  const s = await getSettings();
  if (!s.resendApiKey) {
    console.warn(`[email] مفتاح Resend غير مضبوط — لم تُرسل الرسالة إلى ${to}: ${subject}`);
    return { ok: false, skipped: true as const };
  }
  try {
    const resend = new Resend(s.resendApiKey);
    const payload: Record<string, unknown> = {
      from: s.emailFrom || "onboarding@resend.dev",
      to,
      subject,
      html,
    };
    if (s.emailReplyTo) payload.replyTo = s.emailReplyTo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await resend.emails.send(payload as any);
    if (error) {
      console.error("[email] فشل الإرسال:", error);
      return { ok: false as const, error };
    }
    return { ok: true as const, id: data?.id };
  } catch (e) {
    console.error("[email] استثناء أثناء الإرسال:", e);
    return { ok: false as const, error: e };
  }
}

export function sendConfirmEmail(to: string, vars: Parameters<typeof confirmEmail>[0]) {
  const { subject, html } = confirmEmail(vars);
  return send(to, subject, html);
}

export function sendDeliveryEmail(to: string, vars: Parameters<typeof deliveryEmail>[0]) {
  const { subject, html } = deliveryEmail(vars);
  return send(to, subject, html);
}

export function sendReceiptEmail(to: string, vars: Parameters<typeof receiptEmail>[0]) {
  const { subject, html } = receiptEmail(vars);
  return send(to, subject, html);
}

export function sendLoginLinkEmail(to: string, vars: Parameters<typeof loginLinkEmail>[0]) {
  const { subject, html } = loginLinkEmail(vars);
  return send(to, subject, html);
}

export function sendNewsletterEmail(to: string, vars: Parameters<typeof newsletterEmail>[0]) {
  const { subject, html } = newsletterEmail(vars);
  return send(to, subject, html);
}

// رسالة اختبار للتحقق من عمل Resend من لوحة التحكم
export function sendTestEmail(to: string) {
  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><body style="margin:0;background:#FBF7F0;font-family:Tajawal,Arial,sans-serif">
    <div style="max-width:480px;margin:24px auto;background:#fff;border-radius:16px;padding:32px;text-align:center;border:1px solid #EADCC6">
      <div style="font-size:40px">✅</div>
      <h2 style="color:#1E1B2E;margin:8px 0">يعمل البريد بنجاح</h2>
      <p style="color:#4B475F;line-height:1.9">هذه رسالة اختبار من <b>مكتبة محمد المسقري</b>. إن وصلتك، فإعدادات Resend تعمل بشكل صحيح ويمكنك إرسال رسائل التأكيد والتسليم والإيصالات لعملائك.</p>
    </div></body></html>`;
  return send(to, "اختبار البريد — مكتبة محمد المسقري", html);
}
