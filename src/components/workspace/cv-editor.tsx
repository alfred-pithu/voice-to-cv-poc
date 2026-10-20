"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import {
  addCertification,
  addEducation,
  addExperience,
  addExperienceBullet,
  addProject,
  addSkillGroup,
  removeCertification,
  removeEducation,
  removeExperience,
  removeExperienceBullet,
  removeProject,
  removeSkillGroup,
  reorderSections,
  updateCertificationField,
  updateContactField,
  updateEducationField,
  updateExperienceBullet,
  updateExperienceField,
  updateProjectField,
  updateProjectTechnologies,
  updateSkillGroup,
  updateSummary,
  updateTitle,
} from "@/features/cvs/edits";
import { sectionLabels } from "@/features/cvs/fixtures";
import { createId, type CVDocument, type SectionId } from "@/features/cvs/schema";
import { SectionOrder } from "@/components/workspace/section-order";

type EditorSection = SectionId | "contact";

type CvEditorProps = {
  document: CVDocument;
  section: EditorSection;
  onSection: (section: EditorSection) => void;
  onChange: (document: CVDocument) => void;
};

export function CvEditor({ document, section, onSection, onChange }: CvEditorProps) {
  const [error, setError] = useState<string | null>(null);

  function commit(change: () => CVDocument) {
    try {
      onChange(change());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That change was rejected.");
    }
  }

  return (
    <div className="grid gap-4">
      <SectionOrder
        order={document.sectionOrder}
        active={section}
        onSelect={onSection}
        onReorder={(next) => commit(() => reorderSections(document, next))}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 rounded-3xl border border-line bg-paper-raised p-5">
        <h1 className="serif text-3xl">{sectionLabels[section]}</h1>
        {section === "contact" ? (
          <ContactFields document={document} commit={commit} />
        ) : null}
        {section === "summary" ? (
          <label className="grid gap-1.5 text-sm font-semibold">
            Summary
            <textarea
              className="min-h-36 rounded-xl border border-line bg-paper px-3 py-2 font-normal"
              value={document.summary ?? ""}
              onChange={(event) => commit(() => updateSummary(document, event.target.value))}
            />
          </label>
        ) : null}
        {section === "experience" ? (
          <ExperienceFields document={document} commit={commit} />
        ) : null}
        {section === "education" ? (
          <EducationFields document={document} commit={commit} />
        ) : null}
        {section === "projects" ? <ProjectFields document={document} commit={commit} /> : null}
        {section === "skills" ? <SkillFields document={document} commit={commit} /> : null}
        {section === "certifications" ? (
          <CertificationFields document={document} commit={commit} />
        ) : null}
      </div>
    </div>
  );
}

function ContactFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-3">
      <TextField
        label="Full name"
        value={document.contact.fullName}
        onChange={(event) =>
          commit(() => updateContactField(document, "fullName", event.target.value))
        }
      />
      <EmailField
        value={document.contact.email ?? ""}
        onCommit={(value) => commit(() => updateContactField(document, "email", value))}
      />
      <TextField
        label="Phone"
        value={document.contact.phone ?? ""}
        onChange={(event) =>
          commit(() => updateContactField(document, "phone", event.target.value))
        }
      />
      <TextField
        label="Location"
        value={document.contact.location ?? ""}
        onChange={(event) =>
          commit(() => updateContactField(document, "location", event.target.value))
        }
      />
      <TextField
        label="CV title"
        value={document.title}
        hint="Used in your CV list. It does not print on the page."
        onChange={(event) =>
          commit(() => updateTitle(document, event.target.value))
        }
      />
    </div>
  );
}

function EmailField({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [lastCommitted, setLastCommitted] = useState(value);
  const [error, setError] = useState<string | null>(null);

  if (value !== lastCommitted) {
    setLastCommitted(value);
    setDraft(value);
    setError(null);
  }

  return (
    <TextField
      label="Email"
      type="email"
      value={draft}
      error={error ?? undefined}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        const trimmed = next.trim();
        if (trimmed !== "" && !z.email().safeParse(trimmed).success) {
          setError("Enter a valid email, or leave it blank.");
          return;
        }
        setError(null);
        onCommit(trimmed);
      }}
    />
  );
}

function ExperienceFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-4">
      <Button
        variant="secondary"
        onClick={() =>
          commit(() =>
            addExperience(document, {
              id: createId("exp"),
              company: "",
              role: "",
              bullets: [],
            }),
          )
        }
      >
        Add role
      </Button>
      {document.experience.map((entry) => (
        <fieldset key={entry.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <legend className="px-1 text-sm font-semibold">{entry.role || "New role"}</legend>
          <TextField
            label="Role"
            value={entry.role}
            onChange={(event) =>
              commit(() => updateExperienceField(document, entry.id, "role", event.target.value))
            }
          />
          <TextField
            label="Company"
            value={entry.company}
            onChange={(event) =>
              commit(() => updateExperienceField(document, entry.id, "company", event.target.value))
            }
          />
          <TextField
            label="Location"
            value={entry.location ?? ""}
            onChange={(event) =>
              commit(() => updateExperienceField(document, entry.id, "location", event.target.value))
            }
          />
          <TextField
            label="Start"
            value={entry.startDate ?? ""}
            onChange={(event) =>
              commit(() => updateExperienceField(document, entry.id, "startDate", event.target.value))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(entry.isCurrent)}
              onChange={(event) =>
                commit(() =>
                  updateExperienceField(document, entry.id, "isCurrent", event.target.checked),
                )
              }
            />
            Current role
          </label>
          {entry.bullets.map((bullet) => (
            <div key={bullet.id} className="grid gap-2">
              <label className="grid gap-1.5 text-sm font-semibold">
                Bullet
                <textarea
                  className="min-h-20 rounded-xl border border-line bg-paper px-3 py-2 font-normal"
                  value={bullet.text}
                  onChange={(event) =>
                    commit(() =>
                      updateExperienceBullet(document, entry.id, bullet.id, event.target.value),
                    )
                  }
                />
              </label>
              <Button
                variant="ghost"
                onClick={() => commit(() => removeExperienceBullet(document, entry.id, bullet.id))}
              >
                Remove bullet
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => commit(() => addExperienceBullet(document, entry.id, ""))}
            >
              Add bullet
            </Button>
            <Button variant="ghost" onClick={() => commit(() => removeExperience(document, entry.id))}>
              Remove role
            </Button>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function EducationFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-4">
      <Button
        variant="secondary"
        onClick={() =>
          commit(() =>
            addEducation(document, { id: createId("edu"), institution: "" }),
          )
        }
      >
        Add education
      </Button>
      {document.education.map((entry) => (
        <fieldset key={entry.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <TextField
            label="Institution"
            value={entry.institution}
            onChange={(event) =>
              commit(() => updateEducationField(document, entry.id, "institution", event.target.value))
            }
          />
          <TextField
            label="Qualification"
            value={entry.qualification ?? ""}
            onChange={(event) =>
              commit(() =>
                updateEducationField(document, entry.id, "qualification", event.target.value),
              )
            }
          />
          <TextField
            label="Field"
            value={entry.field ?? ""}
            onChange={(event) =>
              commit(() => updateEducationField(document, entry.id, "field", event.target.value))
            }
          />
          <Button variant="ghost" onClick={() => commit(() => removeEducation(document, entry.id))}>
            Remove education
          </Button>
        </fieldset>
      ))}
    </div>
  );
}

function ProjectFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-4">
      <Button
        variant="secondary"
        onClick={() =>
          commit(() =>
            addProject(document, {
              id: createId("proj"),
              name: "",
              technologies: [],
              bullets: [],
            }),
          )
        }
      >
        Add project
      </Button>
      {document.projects.map((entry) => (
        <fieldset key={entry.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <TextField
            label="Name"
            value={entry.name}
            onChange={(event) =>
              commit(() => updateProjectField(document, entry.id, "name", event.target.value))
            }
          />
          <label className="grid gap-1.5 text-sm font-semibold">
            Description
            <textarea
              className="min-h-20 rounded-xl border border-line bg-paper px-3 py-2 font-normal"
              value={entry.description ?? ""}
              onChange={(event) =>
                commit(() => updateProjectField(document, entry.id, "description", event.target.value))
              }
            />
          </label>
          <TextField
            label="Technologies"
            hint="Separate items with commas."
            value={entry.technologies.join(", ")}
            onChange={(event) =>
              commit(() =>
                updateProjectTechnologies(
                  document,
                  entry.id,
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                ),
              )
            }
          />
          <Button variant="ghost" onClick={() => commit(() => removeProject(document, entry.id))}>
            Remove project
          </Button>
        </fieldset>
      ))}
    </div>
  );
}

function SkillFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-4">
      <Button
        variant="secondary"
        onClick={() =>
          commit(() => addSkillGroup(document, { id: createId("skill"), category: "", items: [] }))
        }
      >
        Add skill group
      </Button>
      {document.skills.map((group) => (
        <fieldset key={group.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <TextField
            label="Category"
            value={group.category}
            onChange={(event) =>
              commit(() => updateSkillGroup(document, group.id, { category: event.target.value }))
            }
          />
          <TextField
            label="Skills"
            hint="Separate items with commas."
            value={group.items.join(", ")}
            onChange={(event) =>
              commit(() =>
                updateSkillGroup(document, group.id, {
                  items: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              )
            }
          />
          <Button variant="ghost" onClick={() => commit(() => removeSkillGroup(document, group.id))}>
            Remove skill group
          </Button>
        </fieldset>
      ))}
    </div>
  );
}

function CertificationFields({
  document,
  commit,
}: {
  document: CVDocument;
  commit: (change: () => CVDocument) => void;
}) {
  return (
    <div className="grid gap-4">
      <Button
        variant="secondary"
        onClick={() =>
          commit(() => addCertification(document, { id: createId("cert"), name: "" }))
        }
      >
        Add certification
      </Button>
      {document.certifications.map((entry) => (
        <fieldset key={entry.id} className="grid gap-3 rounded-2xl border border-line p-4">
          <TextField
            label="Name"
            value={entry.name}
            onChange={(event) =>
              commit(() => updateCertificationField(document, entry.id, "name", event.target.value))
            }
          />
          <TextField
            label="Issuer"
            value={entry.issuer ?? ""}
            onChange={(event) =>
              commit(() => updateCertificationField(document, entry.id, "issuer", event.target.value))
            }
          />
          <Button
            variant="ghost"
            onClick={() => commit(() => removeCertification(document, entry.id))}
          >
            Remove certification
          </Button>
        </fieldset>
      ))}
    </div>
  );
}
