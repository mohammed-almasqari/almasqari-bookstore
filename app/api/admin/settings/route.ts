import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSettingsForAdmin, saveSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  return NextResponse.json(await getSettingsForAdmin());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  const setStr = (key: string, val: unknown) => {
    if (typeof val === "string") updates[key] = val.trim();
  };
  const setBool = (key: string, val: unknown) => {
    updates[key] = val ? "true" : "false";
  };
  // الأسرار: لا تُحدّث إلا إذا أُدخلت قيمة جديدة غير فارغة
  const setSecret = (key: string, val: unknown) => {
    if (typeof val === "string" && val.trim().length > 0) updates[key] = val.trim();
  };

  // PayPal
  if ("paypalEnabled" in body) setBool("paypal_enabled", body.paypalEnabled);
  if ("paypalClientId" in body) setStr("paypal_client_id", body.paypalClientId);
  setSecret("paypal_client_secret", body.paypalClientSecret);
  if ("paypalEnv" in body) {
    updates["paypal_env"] = body.paypalEnv === "live" ? "live" : "sandbox";
  }

  // تحويل بنكي
  if ("bankEnabled" in body) setBool("bank_enabled", body.bankEnabled);
  if ("bankName" in body) setStr("bank_name", body.bankName);
  if ("bankAccountName" in body) setStr("bank_account_name", body.bankAccountName);
  if ("bankIban" in body) setStr("bank_iban", body.bankIban);
  if ("bankAccountNumber" in body) setStr("bank_account_number", body.bankAccountNumber);
  if ("bankSwift" in body) setStr("bank_swift", body.bankSwift);
  if ("bankInstructions" in body) setStr("bank_instructions", body.bankInstructions);

  // Resend
  setSecret("resend_api_key", body.resendApiKey);
  if ("emailFrom" in body) setStr("email_from", body.emailFrom);
  if ("emailReplyTo" in body) setStr("email_reply_to", body.emailReplyTo);

  // التحليلات
  if ("gaId" in body) setStr("analytics_ga", body.gaId);
  if ("pixelId" in body) setStr("analytics_pixel", body.pixelId);

  await saveSettings(updates);
  return NextResponse.json({ ok: true });
}
