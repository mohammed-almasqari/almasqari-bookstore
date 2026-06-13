import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "أدخل بريدًا وكلمة مرور صحيحين." }, { status: 400 });

  const session = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!session) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  await setSessionCookie(session);
  return NextResponse.json({ ok: true });
}
