import { chromium } from "playwright";
import { renderCvHtml } from "@/server/export/cv-markup";
import type { CVDocument } from "@/features/cvs/schema";

export async function renderCvPdf(document: CVDocument): Promise<Buffer> {
  const html = renderCvHtml(document);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
