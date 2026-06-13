import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveCoverFile, deleteCoverFile } from "@/lib/storage";
import { fdStr, fdBool, fdFile, fdHas } from "@/lib/formdata";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "المقال غير موجود." }, { status: 404 });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const willPublish = fdHas(fd, "isPublished") ? fdBool(fd, "isPublished") : post.isPublished;
  const data: any = {
    title: fdStr(fd, "title") || post.title,
    excerpt: fdHas(fd, "excerpt") ? fdStr(fd, "excerpt") || null : post.excerpt,
    content: fdStr(fd, "content") || post.content,
    isPublished: willPublish,
    publishedAt: willPublish ? post.publishedAt ?? new Date() : null,
  };

  const cover = fdFile(fd, "cover");
  if (cover) {
    await deleteCoverFile(post.coverFile);
    try {
      data.coverFile = (await saveCoverFile(cover)).filename;
    } catch {
      return NextResponse.json({ error: "تعذّر رفع الصورة." }, { status: 500 });
    }
  }

  await prisma.post.update({ where: { id: post.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (post) {
    await deleteCoverFile(post.coverFile);
    await prisma.post.delete({ where: { id: post.id } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
