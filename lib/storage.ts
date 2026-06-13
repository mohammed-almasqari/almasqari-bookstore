import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "./env";

/**
 * تخزين الملفات المرفوعة (الكتب والأغلفة) على القرص داخل مجلد دائم.
 * في الإنتاج يُربط UPLOAD_DIR بحجم Docker حتى لا تُفقد الملفات عند إعادة النشر.
 */

const BOOKS_DIR = "books";
const COVERS_DIR = "covers";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function safeExt(filename: string, fallback: string): string {
  const ext = path.extname(filename || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || fallback;
}

// يحفظ ملف الكتاب ويعيد اسم الملف المخزّن
export async function saveBookFile(file: File): Promise<{ filename: string; size: number }> {
  const dir = path.join(env.uploadDir, BOOKS_DIR);
  await ensureDir(dir);
  const ext = safeExt(file.name, ".pdf");
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return { filename, size: buffer.length };
}

// يحفظ صورة الغلاف ويعيد اسم الملف المخزّن
export async function saveCoverFile(file: File): Promise<{ filename: string; size: number }> {
  const dir = path.join(env.uploadDir, COVERS_DIR);
  await ensureDir(dir);
  const ext = safeExt(file.name, ".jpg");
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return { filename, size: buffer.length };
}

export async function readBookFile(filename: string): Promise<Buffer> {
  const filePath = path.join(env.uploadDir, BOOKS_DIR, path.basename(filename));
  return fs.readFile(filePath);
}

export async function readCoverFile(filename: string): Promise<Buffer> {
  const filePath = path.join(env.uploadDir, COVERS_DIR, path.basename(filename));
  return fs.readFile(filePath);
}

export async function deleteBookFile(filename?: string | null) {
  if (!filename) return;
  await fs.unlink(path.join(env.uploadDir, BOOKS_DIR, path.basename(filename))).catch(() => {});
}

export async function deleteCoverFile(filename?: string | null) {
  if (!filename) return;
  await fs.unlink(path.join(env.uploadDir, COVERS_DIR, path.basename(filename))).catch(() => {});
}

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".epub": "application/epub+zip",
    ".zip": "application/zip",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[ext] || "application/octet-stream";
}
