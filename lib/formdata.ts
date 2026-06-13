// أدوات قراءة حقول FormData بأمان

export function fdStr(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}
export function fdBool(fd: FormData, k: string): boolean {
  const v = fd.get(k);
  return v === "true" || v === "on" || v === "1";
}
export function fdNum(fd: FormData, k: string, def = 0): number {
  const n = Number(fdStr(fd, k));
  return Number.isFinite(n) ? n : def;
}
export function fdFile(fd: FormData, k: string): File | null {
  const v = fd.get(k);
  return v instanceof File && v.size > 0 ? v : null;
}
export function fdHas(fd: FormData, k: string): boolean {
  return fd.has(k);
}
