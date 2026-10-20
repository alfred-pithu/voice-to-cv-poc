import { z } from "zod";
import { parseCvDocument } from "@/features/cvs/schema";
import { requireUser } from "@/server/auth/require-user";
import { archiveCv, getCv, updateCv } from "@/server/cvs/repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const cv = await getCv(user.id, id);
  if (!cv) return Response.json({ error: "That CV was not found." }, { status: 404 });
  return Response.json({ cv });
}

const patchSchema = z.object({
  revision: z.number().int().positive(),
  document: z.unknown(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await context.params;
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Send the current revision and a CV document." }, { status: 400 });
  }
  let document;
  try {
    document = parseCvDocument(parsed.data.document);
  } catch {
    return Response.json({ error: "That CV document is not valid." }, { status: 400 });
  }
  const result = await updateCv(user.id, id, document, parsed.data.revision);
  if (result === "missing") return Response.json({ error: "That CV was not found." }, { status: 404 });
  if (result === "conflict") {
    return Response.json({ error: "This CV changed somewhere else. Reload it before saving again." }, { status: 409 });
  }
  return Response.json({ cv: result });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const removed = await archiveCv(user.id, id);
  if (!removed) return Response.json({ error: "That CV was not found." }, { status: 404 });
  return Response.json({ ok: true });
}
