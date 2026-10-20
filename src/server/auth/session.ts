import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { withDatabase } from "@/server/db/pool";
import { hashPassword, verifyPassword } from "@/server/auth/password";

export const sessionCookie = "voxcv_session";
const sessionDays = 30;

export type SessionUser = { id: string; email: string };

export async function registerUser(email: string, password: string, displayName: string) {
  const passwordHash = await hashPassword(password);
  try {
    const result = await withDatabase((client) =>
      client.query<{ register_user: string }>("SELECT auth.register_user($1, $2, $3)", [
        email,
        passwordHash,
        displayName,
      ]),
    );
    return result.rows[0]?.register_user ?? null;
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const credentials = await withDatabase((client) =>
    client.query<{ id: string; encrypted_password: string }>(
      "SELECT id, encrypted_password FROM auth.credentials_for_email($1)",
      [email],
    ),
  );
  const row = credentials.rows[0];
  if (!row || !(await verifyPassword(password, row.encrypted_password))) return null;
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await withDatabase((client) =>
    client.query("SELECT auth.create_session($1, $2, $3)", [row.id, tokenHash, expiresAt]),
  );
  return { token, expiresAt };
}

export async function readSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) return null;
  return userForToken(token);
}

export async function userForToken(token: string): Promise<SessionUser | null> {
  const result = await withDatabase((client) =>
    client.query<SessionUser>("SELECT id, email FROM auth.user_for_session($1)", [hashToken(token)]),
  );
  return result.rows[0] ?? null;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await withDatabase((client) => client.query("SELECT auth.delete_session($1)", [hashToken(token)]));
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
