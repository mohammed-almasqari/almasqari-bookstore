import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerEmail } from "@/lib/customer-auth";
import { createDownloadToken } from "@/lib/tokens";
import { absoluteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

// يتحقق من ملكية العميل للكتاب ثم يولّد رابط تحميل آمن ويحوّل إليه
export async function GET(_req: NextRequest, { params }: { params: { bookId: string } }) {
  const email = await getCustomerEmail();
  if (!email) return NextResponse.redirect(absoluteUrl("/account"));

  const bookId = params.bookId;

  const [order, claim] = await Promise.all([
    prisma.order.findFirst({ where: { bookId, customerEmail: email, status: "PAID" } }),
    prisma.freeClaim.findFirst({ where: { bookId, email, confirmed: true } }),
  ]);

  if (!order && !claim) {
    return NextResponse.redirect(absoluteUrl("/account?error=owns"));
  }

  const dl = await createDownloadToken({
    bookId,
    email,
    orderId: order?.id,
    freeClaimId: claim?.id,
    days: 7,
    maxDownloads: 5,
  });

  return NextResponse.redirect(absoluteUrl(`/api/download/${dl.token}`));
}
