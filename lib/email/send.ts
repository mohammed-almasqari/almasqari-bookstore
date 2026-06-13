import { Resend } from "resend";
import { env } from "../env";
import { confirmEmail, deliveryEmail, receiptEmail } from "./templates";

/**
 * إرسال البريد عبر Resend. إذا لم يُضبط المفتاح، تُسجَّل الرسالة في السجل بدل الفشل
 * (مفيد أثناء التطوير قبل ضبط RESEND_API_KEY).
 */

function client(): Resend | null {
  if (!env.resend.apiKey) return null;
  return new Resend(env.resend.apiKey);
}

async function send(to: string, subject: string, html: string) {
  const resend = client();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY غير مضبوط — لم تُرسل الرسالة إلى ${to}: ${subject}`);
    return { ok: false, skipped: true as const };
  }
  try {
    const payload: Record<string, unknown> = {
      from: env.resend.from,
      to,
      subject,
      html,
    };
    if (env.resend.replyTo) payload.replyTo = env.resend.replyTo;
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
