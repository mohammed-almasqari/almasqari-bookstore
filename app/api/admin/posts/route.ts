import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { saveCoverFile } from "@/lib/storage";
import { fdStr, fdBool, fdFile } from "@/lib/formdata";

export const dynamic = "force-dynamic";

async function uniquePostSlug(base: string): Promise<string> {
  const root = slugify(base);
  let c = root;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ex = await prisma.post.findUnique({ where: { slug: c } });
    if (!ex) return c;
    i += 1;
    c = `${root}-${i}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const title = fdStr(fd, "title");
  const content = fdStr(fd, "content");
  if (title.length < 2) return NextResponse.json({ error: "عنوان المقال مطلوب." }, { status: 400 });
  if (content.length < 10) return NextResponse.json({ error: "محتوى المقال مطلوب." }, { status: 400 });

  let coverFile: string | undefined;
  const cover = fdFile(fd, "cover");
  if (cover) {
    try {
      coverFile = (await saveCoverFile(cover)).filename;
    } catch {
      return NextResponse.json({ error: "تعذّر رفع الصورة." }, { status: 500 });
    }
  }

  const isPublished = fdBool(fd, "isPublished");
  const created = await prisma.post.create({
    data: {
      slug: await uniquePostSlug(fdStr(fd, "slug") || title),
      title,
      excerpt: fdStr(fd, "excerpt") || null,
      content,
      coverFile,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
