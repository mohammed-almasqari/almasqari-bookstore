import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPost(params.slug);
  if (!p) return { title: "مقال غير موجود" };
  const base = env.siteUrl.replace(/\/$/, "");
  const desc = (p.excerpt || p.content).slice(0, 155);
  return {
    title: p.title,
    description: desc,
    alternates: { canonical: `${base}/blog/${p.slug}` },
    openGraph: {
      title: p.title,
      description: desc,
      type: "article",
      locale: "ar_AR",
      url: `${base}/blog/${p.slug}`,
      ...(p.coverFile ? { images: [`${base}/api/post-cover/${p.id}`] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post || !post.isPublished) notFound();

  const base = env.siteUrl.replace(/\/$/, "");
  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: { "@type": "Person", name: "محمد المسقري" },
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    ...(post.coverFile ? { image: `${base}/api/post-cover/${post.id}` } : {}),
    description: (post.excerpt || post.content).slice(0, 200),
  };

  return (
    <article className="container-x py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-shield">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-shield">المدونة</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{post.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">{formatDate(post.publishedAt || post.createdAt)} · محمد المسقري</p>

        {post.coverFile && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/post-cover/${post.id}`} alt={post.title} className="w-full" />
          </div>
        )}

        <div className="mt-8 space-y-5 text-lg leading-9 text-ink-soft">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>

        <div className="mt-10 border-t border-sand-100 pt-6">
          <Link href="/blog" className="text-sm font-bold text-shield hover:underline">← كل المقالات</Link>
        </div>
      </div>
    </article>
  );
}
