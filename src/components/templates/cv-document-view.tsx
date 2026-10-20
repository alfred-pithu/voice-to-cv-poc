import type { CVDocument, SectionId } from "@/features/cvs/schema";
import { sectionLabels } from "@/features/cvs/fixtures";

// Keep this view aligned with src/server/export/cv-markup.ts. The PDF builder cannot import React.

export function CvDocumentView({ document }: { document: CVDocument }) {
  const meta = [
    document.targetRole,
    document.contact.location,
    document.contact.email,
    document.contact.phone,
  ].filter(Boolean);

  return (
    <article className={`cv cv-${document.templateId}`}>
      <header>
        <h1 className="cv-name">{document.contact.fullName || "Name"}</h1>
        {meta.length > 0 ? <p className="cv-meta">{meta.join(" · ")}</p> : null}
        {document.contact.links.length > 0 ? (
          <p className="cv-meta">
            {document.contact.links.map((link, index) => (
              <span key={link.id}>
                {index > 0 ? " · " : null}
                <a className="cv-url" href={link.url}>
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </header>
      {document.sectionOrder.map((sectionId) => (
        <SectionView key={sectionId} document={document} sectionId={sectionId} />
      ))}
    </article>
  );
}

function SectionView({ document, sectionId }: { document: CVDocument; sectionId: SectionId }) {
  const body = sectionBody(document, sectionId);
  if (!body) return null;
  return (
    <section className="cv-section">
      <h2>{sectionLabels[sectionId]}</h2>
      {body}
    </section>
  );
}

function sectionBody(document: CVDocument, sectionId: SectionId) {
  if (sectionId === "summary") {
    if (!document.summary?.trim()) return null;
    return <p>{document.summary}</p>;
  }
  if (sectionId === "experience") {
    if (document.experience.length === 0) return null;
    return document.experience.map((entry) => (
      <div className="cv-entry" key={entry.id}>
        <h3>
          {entry.role || "Role"} · {entry.company || "Company"}
        </h3>
        <p className="cv-muted">
          {[entry.location, entry.startDate, entry.isCurrent ? "Present" : entry.endDate]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {entry.bullets.length > 0 ? (
          <ul>
            {entry.bullets.map((bullet) => (
              <li key={bullet.id}>{bullet.text}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ));
  }
  if (sectionId === "education") {
    if (document.education.length === 0) return null;
    return document.education.map((entry) => (
      <div className="cv-entry" key={entry.id}>
        <h3>{entry.institution || "School"}</h3>
        <p className="cv-muted">
          {[entry.qualification, entry.field, entry.startDate, entry.endDate].filter(Boolean).join(" · ")}
        </p>
        {entry.details && entry.details.length > 0 ? (
          <ul>
            {entry.details.map((detail, index) => (
              <li key={`${entry.id}-detail-${index}`}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ));
  }
  if (sectionId === "projects") {
    if (document.projects.length === 0) return null;
    return document.projects.map((entry) => (
      <div className="cv-entry" key={entry.id}>
        <h3>{entry.name || "Project"}</h3>
        {entry.description ? <p>{entry.description}</p> : null}
        {entry.url ? (
          <p>
            <a className="cv-url" href={entry.url}>
              {entry.url}
            </a>
          </p>
        ) : null}
        {entry.technologies.length > 0 ? <p className="cv-muted">{entry.technologies.join(", ")}</p> : null}
        {entry.bullets.length > 0 ? (
          <ul>
            {entry.bullets.map((bullet, index) => (
              <li key={`${entry.id}-bullet-${index}`}>{bullet}</li>
            ))}
          </ul>
        ) : null}
      </div>
    ));
  }
  if (sectionId === "skills") {
    if (document.skills.length === 0) return null;
    return document.skills.map((group) => (
      <p className="cv-entry" key={group.id}>
        <strong>{group.category || "Skills"}: </strong>
        {group.items.join(", ")}
      </p>
    ));
  }
  if (document.certifications.length === 0) return null;
  return document.certifications.map((entry) => (
    <div className="cv-entry" key={entry.id}>
      <h3>{entry.name || "Certification"}</h3>
      <p className="cv-muted">{[entry.issuer, entry.date].filter(Boolean).join(" · ")}</p>
      {entry.url ? (
        <p>
          <a className="cv-url" href={entry.url}>
            {entry.url}
          </a>
        </p>
      ) : null}
    </div>
  ));
}
