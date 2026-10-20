/** @vitest-environment node */

import { expect, test } from "vitest";
import { POST } from "@/app/api/export/pdf/route";
import { sampleCv } from "@/features/cvs/fixtures";
import { longCv } from "@/features/cvs/qa-fixtures";
import { renderCvPdf } from "@/server/export/render-pdf";

test("PDF export returns selectable text for the posted CV only", async () => {
  const shortPdf = await renderCvPdf(sampleCv);
  const longPdf = await renderCvPdf(longCv);
  expect(shortPdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pageCount(shortPdf)).toBeGreaterThan(0);
  expect(pageCount(longPdf)).toBeGreaterThan(pageCount(shortPdf));
  expect(pdfIncludes(shortPdf, "Amina Rahman")).toBe(true);
  expect(pdfIncludes(shortPdf, "José Álvarez")).toBe(false);
  expect(pdfIncludes(longPdf, "José")).toBe(true);

  const response = await POST(
    new Request("http://localhost/api/export/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sampleCv),
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("application/pdf");
  const body = Buffer.from(await response.arrayBuffer());
  expect(pdfIncludes(body, "Amina Rahman")).toBe(true);

  const rejected = await POST(
    new Request("http://localhost/api/export/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...sampleCv, ownerId: "someone-else", injected: true }),
    }),
  );
  expect(rejected.status).toBe(400);
}, 60_000);

function pageCount(pdf: Buffer) {
  return pdf.toString("latin1").match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
}

function pdfIncludes(pdf: Buffer, value: string) {
  const latin = pdf.toString("latin1");
  if (latin.includes(value)) return true;
  const utf16le = Buffer.from(value, "utf16le");
  if (latin.includes(utf16le.toString("latin1"))) return true;
  const utf16be = Buffer.from(utf16le).swap16();
  if (latin.includes(utf16be.toString("latin1"))) return true;
  return latin.toLowerCase().includes(utf16be.toString("hex"));
}
