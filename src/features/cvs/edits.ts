import {
  createId,
  parseCvDocument,
  sectionIds,
  type CertificationEntry,
  type CVDocument,
  type EducationEntry,
  type ExperienceEntry,
  type ProjectEntry,
  type SectionId,
  type SkillGroup,
} from "@/features/cvs/schema";

type Stamp = string | undefined;

function touch(document: CVDocument, now?: Stamp): CVDocument {
  return parseCvDocument({
    ...document,
    updatedAt: now ?? new Date().toISOString(),
  });
}

function requireEntry<T extends { id: string }>(
  entries: T[],
  id: string,
  label: string,
): T {
  const entry = entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown ${label}: ${id}`);
  return entry;
}

export function updateSummary(document: CVDocument, text: string, now?: Stamp): CVDocument {
  return touch({ ...document, summary: text }, now);
}

export function updateTitle(document: CVDocument, title: string, now?: Stamp): CVDocument {
  return touch({ ...document, title }, now);
}

export function updateContactField(
  document: CVDocument,
  field: "fullName" | "email" | "phone" | "location",
  value: string,
  now?: Stamp,
): CVDocument {
  return touch(
    {
      ...document,
      contact: { ...document.contact, [field]: value },
    },
    now,
  );
}

export function addExperience(
  document: CVDocument,
  entry: ExperienceEntry,
  now?: Stamp,
): CVDocument {
  return touch({ ...document, experience: [entry, ...document.experience] }, now);
}

export function updateExperienceField(
  document: CVDocument,
  entryId: string,
  field: "company" | "role" | "location" | "startDate" | "endDate" | "isCurrent",
  value: string | boolean | null,
  now?: Stamp,
): CVDocument {
  requireEntry(document.experience, entryId, "experience");
  return touch(
    {
      ...document,
      experience: document.experience.map((entry) => {
        if (entry.id !== entryId) return entry;
        if (field === "isCurrent") {
          const isCurrent = Boolean(value);
          return { ...entry, isCurrent, endDate: isCurrent ? null : entry.endDate };
        }
        return { ...entry, [field]: value };
      }),
    },
    now,
  );
}

export function removeExperience(document: CVDocument, entryId: string, now?: Stamp): CVDocument {
  requireEntry(document.experience, entryId, "experience");
  return touch(
    {
      ...document,
      experience: document.experience.filter((entry) => entry.id !== entryId),
    },
    now,
  );
}

export function addExperienceBullet(
  document: CVDocument,
  entryId: string,
  text: string,
  options?: { id?: string; now?: string },
): CVDocument {
  requireEntry(document.experience, entryId, "experience");
  return touch(
    {
      ...document,
      experience: document.experience.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              bullets: [...entry.bullets, { id: options?.id ?? createId("bul"), text }],
            }
          : entry,
      ),
    },
    options?.now,
  );
}

export function updateExperienceBullet(
  document: CVDocument,
  entryId: string,
  bulletId: string,
  text: string,
  now?: Stamp,
): CVDocument {
  const entry = requireEntry(document.experience, entryId, "experience");
  if (!entry.bullets.some((bullet) => bullet.id === bulletId)) {
    throw new Error(`Unknown experience bullet: ${bulletId}`);
  }
  return touch(
    {
      ...document,
      experience: document.experience.map((item) =>
        item.id === entryId
          ? {
              ...item,
              bullets: item.bullets.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : item,
      ),
    },
    now,
  );
}

export function removeExperienceBullet(
  document: CVDocument,
  entryId: string,
  bulletId: string,
  now?: Stamp,
): CVDocument {
  const entry = requireEntry(document.experience, entryId, "experience");
  if (!entry.bullets.some((bullet) => bullet.id === bulletId)) {
    throw new Error(`Unknown experience bullet: ${bulletId}`);
  }
  return touch(
    {
      ...document,
      experience: document.experience.map((item) =>
        item.id === entryId
          ? { ...item, bullets: item.bullets.filter((bullet) => bullet.id !== bulletId) }
          : item,
      ),
    },
    now,
  );
}

export function addEducation(document: CVDocument, entry: EducationEntry, now?: Stamp): CVDocument {
  return touch({ ...document, education: [entry, ...document.education] }, now);
}

export function updateEducationField(
  document: CVDocument,
  entryId: string,
  field: "institution" | "qualification" | "field" | "startDate" | "endDate",
  value: string,
  now?: Stamp,
): CVDocument {
  requireEntry(document.education, entryId, "education");
  return touch(
    {
      ...document,
      education: document.education.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    },
    now,
  );
}

export function removeEducation(document: CVDocument, entryId: string, now?: Stamp): CVDocument {
  requireEntry(document.education, entryId, "education");
  return touch(
    {
      ...document,
      education: document.education.filter((entry) => entry.id !== entryId),
    },
    now,
  );
}

export function addProject(document: CVDocument, entry: ProjectEntry, now?: Stamp): CVDocument {
  return touch({ ...document, projects: [entry, ...document.projects] }, now);
}

export function updateProjectField(
  document: CVDocument,
  entryId: string,
  field: "name" | "description" | "url",
  value: string,
  now?: Stamp,
): CVDocument {
  requireEntry(document.projects, entryId, "project");
  return touch(
    {
      ...document,
      projects: document.projects.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    },
    now,
  );
}

export function updateProjectTechnologies(
  document: CVDocument,
  entryId: string,
  technologies: string[],
  now?: Stamp,
): CVDocument {
  requireEntry(document.projects, entryId, "project");
  return touch(
    {
      ...document,
      projects: document.projects.map((entry) =>
        entry.id === entryId ? { ...entry, technologies } : entry,
      ),
    },
    now,
  );
}

export function removeProject(document: CVDocument, entryId: string, now?: Stamp): CVDocument {
  requireEntry(document.projects, entryId, "project");
  return touch(
    {
      ...document,
      projects: document.projects.filter((entry) => entry.id !== entryId),
    },
    now,
  );
}

export function addSkillGroup(document: CVDocument, entry: SkillGroup, now?: Stamp): CVDocument {
  return touch({ ...document, skills: [...document.skills, entry] }, now);
}

export function updateSkillGroup(
  document: CVDocument,
  entryId: string,
  patch: { category?: string; items?: string[] },
  now?: Stamp,
): CVDocument {
  requireEntry(document.skills, entryId, "skill group");
  return touch(
    {
      ...document,
      skills: document.skills.map((entry) =>
        entry.id === entryId ? { ...entry, ...patch } : entry,
      ),
    },
    now,
  );
}

export function removeSkillGroup(document: CVDocument, entryId: string, now?: Stamp): CVDocument {
  requireEntry(document.skills, entryId, "skill group");
  return touch(
    {
      ...document,
      skills: document.skills.filter((entry) => entry.id !== entryId),
    },
    now,
  );
}

export function addCertification(
  document: CVDocument,
  entry: CertificationEntry,
  now?: Stamp,
): CVDocument {
  return touch({ ...document, certifications: [entry, ...document.certifications] }, now);
}

export function updateCertificationField(
  document: CVDocument,
  entryId: string,
  field: "name" | "issuer" | "date" | "url",
  value: string,
  now?: Stamp,
): CVDocument {
  requireEntry(document.certifications, entryId, "certification");
  return touch(
    {
      ...document,
      certifications: document.certifications.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry,
      ),
    },
    now,
  );
}

export function removeCertification(
  document: CVDocument,
  entryId: string,
  now?: Stamp,
): CVDocument {
  requireEntry(document.certifications, entryId, "certification");
  return touch(
    {
      ...document,
      certifications: document.certifications.filter((entry) => entry.id !== entryId),
    },
    now,
  );
}

export function reorderSections(
  document: CVDocument,
  sectionOrder: SectionId[],
  now?: Stamp,
): CVDocument {
  const unique = new Set(sectionOrder);
  const complete =
    sectionOrder.length === sectionIds.length &&
    unique.size === sectionIds.length &&
    sectionIds.every((id) => unique.has(id));
  if (!complete) {
    throw new Error("section order must include each section once");
  }
  return touch({ ...document, sectionOrder }, now);
}

export function reorderDrag(
  order: readonly SectionId[],
  activeId: SectionId,
  overId: SectionId,
): SectionId[] {
  const from = order.indexOf(activeId);
  const to = order.indexOf(overId);
  if (from < 0 || to < 0 || from === to) return [...order];
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function setTemplate(
  document: CVDocument,
  templateId: CVDocument["templateId"],
  now?: Stamp,
): CVDocument {
  return touch({ ...document, templateId }, now);
}

export function moveSection(
  document: CVDocument,
  sectionId: SectionId,
  direction: -1 | 1,
  now?: Stamp,
): CVDocument {
  const index = document.sectionOrder.indexOf(sectionId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= document.sectionOrder.length) return document;
  const sectionOrder = [...document.sectionOrder];
  const [item] = sectionOrder.splice(index, 1);
  sectionOrder.splice(target, 0, item);
  return reorderSections(document, sectionOrder, now);
}
