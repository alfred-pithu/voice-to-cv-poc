import { sectionLabels } from "@/features/cvs/fixtures";
import type { CVDocument, SectionId } from "@/features/cvs/schema";
import { templateCss } from "@/components/templates/template-css";

export function renderCvHtml(document: CVDocument): string {
  const body = renderArticle(document);
  return `<!DOCTYPE html><html lang="${escapeHtml(document.locale)}"><head><meta charset="utf-8"><title>${escapeHtml(document.contact.fullName || "CV")}</title><style>${templateCss}</style></head><body>${body}</body></html>`;
}

function renderArticle(document: CVDocument): string {
  const meta = [
    document.targetRole,
    document.contact.location,
    document.contact.email,
    document.contact.phone,
  ].filter(Boolean);
  const links = document.contact.links
    .map(
      (link, index) =>
        `${index > 0 ? " · " : ""}<a class="cv-url" href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`,
    )
    .join("");
  const sections = document.sectionOrder.map((sectionId) => renderSection(document, sectionId)).join("");
  return `<article class="cv cv-${document.templateId}"><header><h1 class="cv-name">${escapeHtml(document.contact.fullName || "Name")}</h1>${meta.length > 0 ? `<p class="cv-meta">${escapeHtml(meta.join(" · "))}</p>` : ""}${links ? `<p class="cv-meta">${links}</p>` : ""}</header>${sections}</article>`;
}

function renderSection(document: CVDocument, sectionId: SectionId): string {
  const body = sectionBody(document, sectionId);
  if (!body) return "";
  return `<section class="cv-section"><h2>${escapeHtml(sectionLabels[sectionId])}</h2>${body}</section>`;
}

function sectionBody(document: CVDocument, sectionId: SectionId): string {
  if (sectionId === "summary") {
    return document.summary?.trim() ? `<p>${escapeHtml(document.summary)}</p>` : "";
  }
  if (sectionId === "experience") {
    return document.experience
      .map((entry) => {
        const meta = [entry.location, entry.startDate, entry.isCurrent ? "Present" : entry.endDate]
          .filter(Boolean)
          .join(" · ");
        const bullets = entry.bullets.map((bullet) => `<li>${escapeHtml(bullet.text)}</li>`).join("");
        return `<div class="cv-entry"><h3>${escapeHtml(entry.role || "Role")} · ${escapeHtml(entry.company || "Company")}</h3><p class="cv-muted">${escapeHtml(meta)}</p>${bullets ? `<ul>${bullets}</ul>` : ""}</div>`;
      })
      .join("");
  }
  if (sectionId === "education") {
    return document.education
      .map((entry) => {
        const meta = [entry.qualification, entry.field, entry.startDate, entry.endDate].filter(Boolean).join(" · ");
        const details = (entry.details ?? []).map((detail) => `<li>${escapeHtml(detail)}</li>`).join("");
        return `<div class="cv-entry"><h3>${escapeHtml(entry.institution || "School")}</h3><p class="cv-muted">${escapeHtml(meta)}</p>${details ? `<ul>${details}</ul>` : ""}</div>`;
      })
      .join("");
  }
  if (sectionId === "projects") {
    return document.projects
      .map((entry) => {
        const bullets = entry.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
        return `<div class="cv-entry"><h3>${escapeHtml(entry.name || "Project")}</h3>${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}${entry.url ? `<p><a class="cv-url" href="${escapeHtml(entry.url)}">${escapeHtml(entry.url)}</a></p>` : ""}${entry.technologies.length > 0 ? `<p class="cv-muted">${escapeHtml(entry.technologies.join(", "))}</p>` : ""}${bullets ? `<ul>${bullets}</ul>` : ""}</div>`;
      })
      .join("");
  }
  if (sectionId === "skills") {
    return document.skills
      .map(
        (group) =>
          `<p class="cv-entry"><strong>${escapeHtml(group.category || "Skills")}: </strong>${escapeHtml(group.items.join(", "))}</p>`,
      )
      .join("");
  }
  return document.certifications
    .map((entry) => {
      const meta = [entry.issuer, entry.date].filter(Boolean).join(" · ");
      return `<div class="cv-entry"><h3>${escapeHtml(entry.name || "Certification")}</h3><p class="cv-muted">${escapeHtml(meta)}</p>${entry.url ? `<p><a class="cv-url" href="${escapeHtml(entry.url)}">${escapeHtml(entry.url)}</a></p>` : ""}</div>`;
    })
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
