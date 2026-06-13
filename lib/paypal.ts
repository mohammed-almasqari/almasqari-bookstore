import { env } from "./env";

/**
 * تكامل PayPal عبر REST API (بدون مكتبة خادم إضافية).
 * يعمل في وضعي sandbox و live حسب PAYPAL_ENV.
 */

function apiBase(): string {
  return env.paypal.env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${env.paypal.clientId}:${env.paypal.clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
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

// إنشاء طلب دفع، يعيد معرّف الطلب من PayPal
export async function createPayPalOrder(params: {
  amount: string; // مثل "9.90"
  currency: string;
  bookTitle: string;
  referenceId: string;
}): Promise<{ id: string }> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

// التقاط (تحصيل) الدفع بعد موافقة المشتري
export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  captureId?: string;
  payerEmail?: string;
  payerName?: string;
  amount?: string;
  currency?: string;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

export function isPayPalConfigured(): boolean {
  return Boolean(env.paypal.clientId && env.paypal.clientSecret);
}
