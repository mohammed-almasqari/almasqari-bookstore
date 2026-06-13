import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "المدونة",
  description: "مقالات توعوية في الأمن الرقمي والحماية من الاحتيال — من مكتبة محمد المسقري.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container-x py-12">
      <div className="text-center">
        <h1 className="section-title">المدونة</h1>
        <p className="mt-3 text-ink-muted">مقالات توعوية مجانية لحمايتك ووعيك الرقمي.</p>
      </div>

      {posts.length === 0 ? (
        <div className="card mx-auto mt-10 max-w-md p-12 text-center text-ink-muted">لا توجد مقالات بعد.</div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card card-hover flex flex-col overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-ink to-ink-soft">
                {p.coverFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/post-cover/${p.id}`} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-shield-light/40 font-display text-4xl font-extrabold">مقال</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-extrabold leading-snug text-ink line-clamp-2">{p.title}</h2>
                {p.excerpt && <p className="mt-2 text-sm leading-7 text-ink-muted line-clamp-3">{p.excerpt}</p>}
                <div className="mt-auto pt-4 text-xs text-ink-muted">{formatDate(p.publishedAt || p.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
