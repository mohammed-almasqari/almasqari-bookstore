import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readCoverFile, contentTypeFor } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { coverFile: true } });
  if (!post?.coverFile) return NextResponse.json({ error: "no cover" }, { status: 404 });
  try {
    const buffer = await readCoverFile(post.coverFile);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(post.coverFile),
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
