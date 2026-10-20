import { expect, test } from "vitest";
import { sampleCv } from "@/features/cvs/fixtures";
import { addExperience, addExperienceBullet, moveSection, removeExperienceBullet, reorderDrag, reorderSections, setTemplate, updateExperienceBullet, updateSummary } from "@/features/cvs/edits";
import { createHistory, pushHistory, redo, undo } from "@/features/cvs/history";
import { parseCvDocument } from "@/features/cvs/schema";

test("sample CV parses and keeps stable entry ids", () => {
  const document = parseCvDocument(sampleCv);
  expect(document.schemaVersion).toBe(1);
  expect(document.experience[0]?.id).toBe("exp_northwind");
  expect(document.experience[0]?.bullets[0]?.id).toBe("bul_northwind_1");
});

test("invalid documents are rejected", () => {
  expect(() => parseCvDocument({ ...sampleCv, schemaVersion: 2 })).toThrow();
  expect(() => parseCvDocument({ ...sampleCv, ownerId: "" })).toThrow();
  expect(() =>
    parseCvDocument({
      ...sampleCv,
      contact: { ...sampleCv.contact, email: "not-an-email" },
    }),
  ).toThrow();
  expect(() => parseCvDocument({ ...sampleCv, injected: true })).toThrow();
});

test("summary edits do not touch experience", () => {
  const next = updateSummary(sampleCv, "A shorter summary.");
  expect(next.summary).toBe("A shorter summary.");
  expect(next.experience).toEqual(sampleCv.experience);
  expect(next.updatedAt).not.toBe(sampleCv.updatedAt);
});

test("experience bullets use ids and can be removed", () => {
  const withBullet = addExperienceBullet(sampleCv, "exp_northwind", "Shipped the hiring flow.", {
    id: "bul_new",
    now: "2026-10-20T12:00:00.000Z",
  });
  expect(withBullet.experience[0]?.bullets.map((bullet) => bullet.id)).toContain("bul_new");

  const edited = updateExperienceBullet(
    withBullet,
    "exp_northwind",
    "bul_new",
    "Shipped the hiring flow with the research team.",
  );
  expect(edited.experience[0]?.bullets.at(-1)?.text).toContain("research team");

  const removed = removeExperienceBullet(edited, "exp_northwind", "bul_new");
  expect(removed.experience[0]?.bullets.map((bullet) => bullet.id)).not.toContain("bul_new");
});

test("missing targets are rejected", () => {
  expect(() => addExperienceBullet(sampleCv, "missing", "Nope.")).toThrow(/experience/);
  expect(() => reorderSections(sampleCv, ["summary"])).toThrow(/section/);
});

test("section moves keep every section exactly once", () => {
  const moved = moveSection(sampleCv, "projects", -1);
  expect(moved.sectionOrder.indexOf("projects")).toBeLessThan(
    moved.sectionOrder.indexOf("education"),
  );
  expect(new Set(moved.sectionOrder).size).toBe(moved.sectionOrder.length);
  expect(moved.contact).toEqual(sampleCv.contact);
});

test("adding experience keeps the previous entries", () => {
  const next = addExperience(
    sampleCv,
    {
      id: "exp_new",
      company: "Harbor",
      role: "Designer",
      bullets: [],
    },
    "2026-10-20T12:00:00.000Z",
  );
  expect(next.experience.map((entry) => entry.id)).toEqual(["exp_new", "exp_northwind"]);
});

test("undo and redo restore the same document", () => {
  const started = createHistory(sampleCv);
  const edited = pushHistory(started, updateSummary(sampleCv, "Edited."));
  const undone = undo(edited);
  expect(undone.present.summary).toBe(sampleCv.summary);
  const redone = redo(undone);
  expect(redone.present.summary).toBe("Edited.");
  expect(undo(started)).toEqual(started);
});

test("dragging a section jumps it without dropping any section", () => {
  const next = reorderDrag(sampleCv.sectionOrder, "projects", "summary");
  expect(next[0]).toBe("projects");
  expect(next).toHaveLength(sampleCv.sectionOrder.length);
  expect(new Set(next).size).toBe(next.length);
  const document = reorderSections(sampleCv, next);
  expect(document.contact).toEqual(sampleCv.contact);
  expect(document.experience).toEqual(sampleCv.experience);
});

test("template changes leave the career facts alone", () => {
  const next = setTemplate(sampleCv, "editorial", sampleCv.updatedAt);
  expect(next.templateId).toBe("editorial");
  expect(next.summary).toBe(sampleCv.summary);
  expect(next.experience).toEqual(sampleCv.experience);
  expect(next.contact).toEqual(sampleCv.contact);
  expect(next.sectionOrder).toEqual(sampleCv.sectionOrder);
});
