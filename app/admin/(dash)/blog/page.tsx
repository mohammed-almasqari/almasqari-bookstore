import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import DeletePostButton from "@/components/admin/DeletePostButton";
import { PlusIcon, EditIcon, CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "المدونة" };

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">المدونة</h1>
          <p className="mt-1 text-sm text-ink-muted">{posts.length} مقال · مقالات توعوية تجلب زوّارًا من البحث.</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary h-11 px-5 text-sm"><PlusIcon className="h-5 w-5" /> مقال جديد</Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-200 bg-white p-12 text-center">
          <p className="text-ink-muted">لا توجد مقالات بعد.</p>
          <Link href="/admin/blog/new" className="btn-primary mt-4 inline-flex"><PlusIcon className="h-5 w-5" /> اكتب أول مقال</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
          <ul className="divide-y divide-sand-100">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-ink">{p.title}</h3>
                    {p.isPublished ? (
                      <span className="badge bg-safe/10 text-safe"><CheckIcon className="h-3 w-3" /> منشور</span>
                    ) : (
                      <span className="badge bg-ink/10 text-ink-muted">مسودة</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{p.excerpt || "—"} · {formatDate(p.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/admin/blog/${p.id}`} className="grid h-9 w-9 place-items-center rounded-lg border border-sand-200 text-ink-muted hover:border-shield hover:text-shield" title="تعديل"><EditIcon className="h-4 w-4" /></Link>
                  <DeletePostButton id={p.id} title={p.title} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
