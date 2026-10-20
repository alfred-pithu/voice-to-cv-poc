import { z } from "zod";
import { cookies } from "next/headers";
import { sessionCookie, sessionCookieOptions, signIn } from "@/server/auth/session";
import { databaseConfigured } from "@/server/db/pool";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return Response.json({ error: "Accounts are not configured on this server." }, { status: 503 });
  }
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const session = await signIn(parsed.data.email, parsed.data.password);
  if (!session) {
    return Response.json({ error: "Email or password is wrong." }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, session.token, sessionCookieOptions(session.expiresAt));
  return Response.json({ ok: true });
}
