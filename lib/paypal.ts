import { getSettings } from "./settings";

/**
 * تكامل PayPal عبر REST API.
 * تُقرأ المفاتيح من إعدادات لوحة التحكم (قاعدة البيانات) مع التراجع لمتغيّرات البيئة.
 */

async function config() {
  const s = await getSettings();
  return {
    clientId: s.paypalClientId,
    clientSecret: s.paypalClientSecret,
    env: s.paypalEnv,
    enabled: s.paypalEnabled,
  };
}

function apiBase(envName: string): string {
  return envName === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(clientId: string, clientSecret: string, envName: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase(envName)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(params: {
  amount: string;
  currency: string;
  bookTitle: string;
  referenceId: string;
}): Promise<{ id: string }> {
  const c = await config();
  const token = await getAccessToken(c.clientId, c.clientSecret, c.env);
  const res = await fetch(`${apiBase(c.env)}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.bookTitle.slice(0, 127),
          amount: { currency_code: params.currency, value: params.amount },
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { id: string };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  captureId?: string;
  payerEmail?: string;
  payerName?: string;
  amount?: string;
  currency?: string;
}> {
  const c = await config();
  const token = await getAccessToken(c.clientId, c.clientSecret, c.env);
  const res = await fetch(`${apiBase(c.env)}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(data)}`);
  }
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const payer = data?.payer;
  return {
    status: data?.status,
    captureId: capture?.id,
    payerEmail: payer?.email_address,
    payerName: [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" "),
    amount: capture?.amount?.value,
    currency: capture?.amount?.currency_code,
  };
}

// مفعّل ومهيّأ (له مفاتيح)؟
export async function isPayPalReady(): Promise<boolean> {
  const c = await config();
  return Boolean(c.enabled && c.clientId && c.clientSecret);
}

// اختبار صحة مفاتيح PayPal بمحاولة الحصول على رمز وصول (OAuth)
export async function testPayPalCredentials(): Promise<{ ok: boolean; env: string; error?: string }> {
  const c = await config();
  if (!c.clientId || !c.clientSecret) {
    return { ok: false, env: c.env, error: "أدخل Client ID و Secret أولًا واحفظ." };
  }
  try {
    await getAccessToken(c.clientId, c.clientSecret, c.env);
    return { ok: true, env: c.env };
  } catch (e: any) {
    const raw = e?.message || String(e);
    return { ok: false, env: c.env, error: raw };
  }
}
