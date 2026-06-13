import Link from "next/link";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/env";
import { createDownloadToken } from "@/lib/tokens";
import { sendDeliveryEmail } from "@/lib/email/send";
import { CheckIcon, DownloadIcon, MailIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "تأكيد البريد" };

const EXPIRY_DAYS = 30;

async function confirmClaim(token: string) {
  const claim = await prisma.freeClaim.findUnique({
    where: { confirmToken: token },
    include: { book: true },
  });
  if (!claim) return { status: "invalid" as const };

  let dl = await prisma.downloadToken.findFirst({
    where: { freeClaimId: claim.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  const firstTime = !claim.confirmed;
  if (firstTime) {
    await prisma.freeClaim.update({
      where: { id: claim.id },
      data: { confirmed: true, confirmedAt: new Date() },
    });
  }
  if (!dl) {
    dl = await createDownloadToken({
      bookId: claim.bookId,
      email: claim.email,
      freeClaimId: claim.id,
      days: EXPIRY_DAYS,
    });
  }

  const downloadUrl = absoluteUrl(`/api/download/${dl.token}`);

  if (firstTime) {
    await sendDeliveryEmail(claim.email, {
      name: claim.name,
      bookTitle: claim.book.title,
      downloadUrl,
      expiresLabel: `${EXPIRY_DAYS} يومًا`,
      paid: false,
    });
  }

  return {
    status: "ok" as const,
    name: claim.name,
    bookTitle: claim.book.title,
    hasFile: !!claim.book.bookFile,
    downloadUrl,
  };
}

export default async function ConfirmPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  const result = token ? await confirmClaim(token) : { status: "invalid" as const };

  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="card w-full max-w-lg p-8 text-center sm:p-12">
        {result.status === "ok" ? (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-safe text-white">
              <CheckIcon className="h-9 w-9" strokeWidth={2.5} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">تم تأكيد بريدك! 🎉</h1>
            <p className="mt-3 leading-8 text-ink-soft">
              {result.name}، نسختك من كتاب <b className="text-ink">«{result.bookTitle}»</b> جاهزة.
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-ink-muted">
              <MailIcon className="h-4 w-4" /> أرسلنا الرابط أيضًا إلى بريدك.
            </p>

            {result.hasFile ? (
              <a href={result.downloadUrl} className="btn-safe mt-7 w-full" target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="h-5 w-5" /> تحميل الكتاب الآن
              </a>
            ) : (
              <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                سيتوفّر ملف الكتاب للتحميل قريبًا جدًا، وسنرسله إلى بريدك فور جهوزيته.
              </div>
            )}

            <Link href="/books" className="mt-4 inline-block text-sm font-bold text-shield hover:underline">
              تصفّح بقية المكتبة ←
            </Link>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-alert/10 text-alert">
              <MailIcon className="h-9 w-9" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">رابط غير صالح</h1>
            <p className="mt-3 leading-8 text-ink-soft">
              رابط التأكيد غير صحيح أو منتهي الصلاحية. يمكنك التسجيل من جديد للحصول على رابط جديد.
            </p>
            <Link href="/free" className="btn-primary mt-7">العودة لصفحة الكتب المجانية</Link>
          </>
        )}
      </div>
    </div>
  );
}
