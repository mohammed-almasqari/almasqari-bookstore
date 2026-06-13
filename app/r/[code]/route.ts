import { NextRequest, NextResponse } from "next/server";
import { recordReferralClick } from "@/lib/referrals";
import { absoluteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

// رابط الإحالة: يسجّل النقرة ثم يحوّل إلى الرئيسية حاملًا الرمز ليُلتقط محليًا
export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40);
  await recordReferralClick(code).catch(() => {});
  return NextResponse.redirect(absoluteUrl(`/?ref=${encodeURIComponent(code)}`));
}
