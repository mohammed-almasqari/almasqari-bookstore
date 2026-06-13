import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

async function uniqueSeriesSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ex = await prisma.series.findUnique({ where: { slug: candidate } });
    if (!ex || ex.id === excludeId) return candidate;
    i += 1;
    candidate = `${root}-${i}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = (body?.title || "").trim();
  if (title.length < 2) return NextResponse.json({ error: "اسم السلسلة مطلوب." }, { status: 400 });

  const slug = await uniqueSeriesSlug(body?.slug || title);
  const created = await prisma.series.create({
    data: {
      slug,
      title,
      description: (body?.description || "").trim() || null,
      sortOrder: Number(body?.sortOrder) || 0,
      isPublished: body?.isPublished === false ? false : true,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
