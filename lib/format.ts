// أدوات تنسيق مشتركة

const AR_CURRENCY: Record<string, string> = {
  USD: "دولار",
  EUR: "يورو",
  SAR: "ريال",
  AED: "درهم",
  OMR: "ريال عماني",
};

export function formatPrice(cents: number, currency = "USD"): string {
  const value = (cents / 100).toFixed(2).replace(/\.00$/, "");
  const symbol = AR_CURRENCY[currency] || currency;
  return `${value} ${symbol}`;
}

export function priceToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  const units = ["بايت", "كيلوبايت", "ميغابايت", "غيغابايت"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} — ${hh}:${mm}`;
}
