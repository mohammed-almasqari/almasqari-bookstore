import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  bookId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات التقييم غير صحيحة." }, { status: 400 });

  const { bookId, name, rating, comment } = parsed.data;
  const book = await prisma.book.findFirst({ where: { id: bookId, isPublished: true }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "الكتاب غير موجود." }, { status: 404 });

  await prisma.review.create({
    data: { bookId, name, rating, comment: comment || null, approved: true },
  });

  return NextResponse.json({ ok: true });
}
