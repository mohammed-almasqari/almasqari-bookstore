import { Resend } from "resend";
import { getSettings } from "../settings";
import { confirmEmail, deliveryEmail, receiptEmail, loginLinkEmail } from "./templates";

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
