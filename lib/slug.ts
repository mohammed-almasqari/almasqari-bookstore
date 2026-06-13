import { prisma } from "./db";

// يحوّل العنوان إلى معرّف رابط (يدعم العربية واللاتينية)
export function slugify(s: string): string {
  return (
    s
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "book"
  );
}

// يضمن تفرّد المعرّف في قاعدة البيانات
export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.book.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
    candidate = `${root}-${i}`;
  }
}
