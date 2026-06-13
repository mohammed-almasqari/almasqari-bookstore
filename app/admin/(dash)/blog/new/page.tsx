import Link from "next/link";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "مقال جديد" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm font-bold text-shield hover:underline">← العودة للمدونة</Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">مقال جديد</h1>
      </div>
      <PostForm mode="create" />
    </div>
  );
}
