import { requireUser } from "@/server/auth/require-user";
import { duplicateCv } from "@/server/cvs/repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const copy = await duplicateCv(user.id, id);
  if (!copy) return Response.json({ error: "That CV was not found." }, { status: 404 });
  return Response.json({ cv: copy }, { status: 201 });
}
