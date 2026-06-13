import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 100) : [];
  if (ids.length === 0) return NextResponse.json({ books: [] });

  const books = await prisma.book.findMany({
    where: { id: { in: ids }, isPublished: true },
    select: {
      id: true, slug: true, title: true, subtitle: true,
      isFree: true, priceCents: true, currency: true, category: true, coverFile: true,
    },
  });
  return NextResponse.json({ books });
}
