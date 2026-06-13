import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";

/**
 * مصادقة العميل بدون كلمة مرور: رابط سحري يُرسل بالبريد.
 * - رمز سحري قصير العمر (ساعة) يُرسل في البريد.
 * - بعد التحقق تُنشأ جلسة عميل (كوكي) صالحة 30 يومًا.
 */

export const CUSTOMER_COOKIE = "customer_session";
const COOKIE = CUSTOMER_COOKIE;
const secret = new TextEncoder().encode(env.authSecret);
export const CUSTOMER_SESSION_AGE = 60 * 60 * 24 * 30; // 30 يومًا
const SESSION_AGE = CUSTOMER_SESSION_AGE;
const MAGIC_AGE = 60 * 60; // ساعة

// ينشئ رمز جلسة العميل (لضبطه على الاستجابة مباشرة في مسارات الـ API)
export async function createCustomerSessionToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase().trim(), kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE}s`)
    .sign(secret);
}

export async function createMagicToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase().trim(), kind: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_AGE}s`)
    .sign(secret);
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.kind !== "magic" || !payload.email) return null;
    return payload.email as string;
  } catch {
    return null;
  }
}

export async function setCustomerSession(email: string) {
  const token = await new SignJWT({ email: email.toLowerCase().trim(), kind: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE}s`)
    .sign(secret);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE,
  });
}

export function clearCustomerSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getCustomerEmail(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.kind !== "session" || !payload.email) return null;
    return payload.email as string;
  } catch {
    return null;
  }
}
