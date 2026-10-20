import { parseCvDocument } from "@/features/cvs/schema";
import { requireUser } from "@/server/auth/require-user";
import { createCv, listCvs } from "@/server/cvs/repository";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const cvs = await listCvs(user.id);
  return Response.json({ cvs });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const document = documentFromBody(body);
  if (!document) {
    return Response.json({ error: "Send a valid CV document." }, { status: 400 });
  }
  const created = await createCv(user.id, document);
  return Response.json({ cv: created }, { status: 201 });
}

function documentFromBody(body: unknown) {
  if (!body || typeof body !== "object" || !("document" in body)) return null;
  try {
    return parseCvDocument((body as { document: unknown }).document);
  } catch {
    return null;
  }
}
