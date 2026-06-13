import { prisma } from "./db";
import { env } from "./env";

/**
 * إعدادات المتجر المخزّنة في قاعدة البيانات (يضبطها المدير من لوحة التحكم).
 * القيم في قاعدة البيانات لها الأولوية، ثم متغيّرات البيئة كقيمة احتياطية.
 */

export type StoreSettings = {
  // PayPal
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalEnv: "sandbox" | "live";
  // تحويل بنكي
  bankEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankIban: string;
  bankAccountNumber: string;
  bankSwift: string;
  bankInstructions: string;
  // البريد (Resend)
  resendApiKey: string;
  emailFrom: string;
  emailReplyTo: string;
  // التحليلات
  gaId: string;
  pixelId: string;
};

export async function getRawSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value;
    return m;
  } catch {
    return {};
  }
}

export async function getSettings(): Promise<StoreSettings> {
  const m = await getRawSettings();
  const b = (k: string, d = false) => (m[k] === undefined ? d : m[k] === "true");
  const s = (k: string, d = "") => (m[k] ?? d);
  return {
    paypalEnabled: b("paypal_enabled", false),
    paypalClientId: s("paypal_client_id", env.paypal.clientId),
    paypalClientSecret: s("paypal_client_secret", env.paypal.clientSecret),
    paypalEnv: (s("paypal_env", env.paypal.env) as "sandbox" | "live") || "sandbox",
    bankEnabled: b("bank_enabled", false),
    bankName: s("bank_name"),
    bankAccountName: s("bank_account_name"),
    bankIban: s("bank_iban"),
    bankAccountNumber: s("bank_account_number"),
    bankSwift: s("bank_swift"),
    bankInstructions: s("bank_instructions"),
    resendApiKey: s("resend_api_key", env.resend.apiKey),
    emailFrom: s("email_from", env.resend.from),
    emailReplyTo: s("email_reply_to", env.resend.replyTo),
    gaId: s("analytics_ga"),
    pixelId: s("analytics_pixel"),
  };
}

export async function saveSettings(updates: Record<string, string>): Promise<void> {
  const entries = Object.entries(updates);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
}

// ملخّص آمن للعرض في الواجهة (يخفي الأسرار، يكشف فقط هل هي مضبوطة)
export async function getSettingsForAdmin() {
  const st = await getSettings();
  return {
    paypalEnabled: st.paypalEnabled,
    paypalClientId: st.paypalClientId,
    paypalEnv: st.paypalEnv,
    paypalSecretSet: Boolean(st.paypalClientSecret),
    bankEnabled: st.bankEnabled,
    bankName: st.bankName,
    bankAccountName: st.bankAccountName,
    bankIban: st.bankIban,
    bankAccountNumber: st.bankAccountNumber,
    bankSwift: st.bankSwift,
    bankInstructions: st.bankInstructions,
    resendKeySet: Boolean(st.resendApiKey),
    emailFrom: st.emailFrom,
    emailReplyTo: st.emailReplyTo,
    gaId: st.gaId,
    pixelId: st.pixelId,
  };
}
