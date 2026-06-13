import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");

  let books: { slug: string; updatedAt: Date }[] = [];
  let series: { slug: string; updatedAt: Date }[] = [];
  try {
    [books, series] = await Promise.all([
      prisma.book.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.series.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    ]);
  } catch {
    // قاعدة البيانات غير متاحة وقت البناء
  }

  const staticPages: MetadataRoute.Sitemap = ["", "/books", "/series", "/free"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));

  const seriesPages: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${base}/series/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const bookPages: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${base}/books/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...seriesPages, ...bookPages];
}
