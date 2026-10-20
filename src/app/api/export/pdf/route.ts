import { cvDocumentSchema } from "@/features/cvs/schema";
import { renderCvPdf } from "@/server/export/render-pdf";

const maxBytes = 200_000;

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return error(413, "This CV is too large to export.");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return error(415, "Send the CV as JSON.");
  }

  const raw = await request.text();
  if (raw.length > maxBytes) {
    return error(413, "This CV is too large to export.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return error(400, "That CV could not be read.");
  }

  const parsed = cvDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return error(400, "That CV could not be exported.");
  }

  try {
    const pdf = await renderCvPdf(parsed.data);
    const filename = pdfFilename(parsed.data.title);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return error(503, "PDF export failed. Try again in a moment.");
  }
}

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function pdfFilename(title: string) {
  const clean = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${clean || "cv"}.pdf`;
}
