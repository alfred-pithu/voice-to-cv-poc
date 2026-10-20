import { cookies } from "next/headers";
import { destroySession, sessionCookie } from "@/server/auth/session";
import { databaseConfigured } from "@/server/db/pool";

export async function POST() {
  if (!databaseConfigured()) {
    return Response.json({ error: "Accounts are not configured on this server." }, { status: 503 });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  await destroySession(token);
  cookieStore.delete(sessionCookie);
  return Response.json({ ok: true });
}
