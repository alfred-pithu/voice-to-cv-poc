import { readSession } from "@/server/auth/session";
import { databaseConfigured } from "@/server/db/pool";

export async function GET() {
  if (!databaseConfigured()) return Response.json({ user: null });
  const user = await readSession();
  if (!user) return Response.json({ user: null });
  return Response.json({ user: { email: user.email } });
}
