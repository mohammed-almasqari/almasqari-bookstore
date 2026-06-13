import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعديل مقال" };

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm font-bold text-shield hover:underline">← العودة للمدونة</Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">تعديل: {post.title}</h1>
      </div>
      <PostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          isPublished: post.isPublished,
          coverFile: post.coverFile,
        }}
      />
    </div>
  );
}
