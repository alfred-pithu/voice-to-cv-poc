import { readSession } from "@/server/auth/session";
import { databaseConfigured } from "@/server/db/pool";

export async function requireUser() {
  if (!databaseConfigured()) {
    return Response.json({ error: "Accounts are not configured on this server." }, { status: 503 });
  }
  const user = await readSession();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  return user;
}
