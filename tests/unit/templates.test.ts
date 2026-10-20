import { expect, test } from "vitest";
import { renderCvHtml } from "@/server/export/cv-markup";
import { setTemplate } from "@/features/cvs/edits";
import { sampleCv } from "@/features/cvs/fixtures";
import { longCv, sparseCv } from "@/features/cvs/qa-fixtures";

test("rendered HTML follows the template and skips empty sections", () => {
  const editorial = setTemplate(sampleCv, "editorial", sampleCv.updatedAt);
  const html = renderCvHtml(editorial);
  expect(html).toContain("cv-editorial");
  expect(html).toContain("Amina Rahman");
  expect(html).toContain("Northwind Studio");

  const sparse = renderCvHtml(sparseCv);
  expect(sparse).toContain("Amina Rahman");
  expect(sparse).not.toContain(">Experience<");
  expect(sparse).not.toContain("No experience yet");
});

test("long fixture keeps the accented name and a long link", () => {
  const html = renderCvHtml(longCv);
  expect(html).toContain("José Álvarez");
  expect(html).toContain("very-long-path");
  expect(html).toContain("Northwind Applied Research Laboratory");
});
