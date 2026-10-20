import { z } from "zod";
import { cookies } from "next/headers";
import {
  registerUser,
  sessionCookie,
  sessionCookieOptions,
  signIn,
} from "@/server/auth/session";
import { databaseConfigured } from "@/server/db/pool";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  if (!databaseConfigured()) return unavailable();
  const parsed = signUpSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return Response.json({ error: "Use a valid email and a password of at least 8 characters." }, { status: 400 });
  }
  const userId = await registerUser(parsed.data.email, parsed.data.password, parsed.data.displayName ?? "");
  if (!userId) {
    return Response.json({ error: "An account with that email already exists." }, { status: 409 });
  }
  const session = await signIn(parsed.data.email, parsed.data.password);
  if (!session) {
    return Response.json({ error: "The account was created, but signing in failed." }, { status: 500 });
  }
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, session.token, sessionCookieOptions(session.expiresAt));
  return Response.json({ ok: true });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function unavailable() {
  return Response.json({ error: "Accounts are not configured on this server." }, { status: 503 });
}
