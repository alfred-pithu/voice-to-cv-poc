import { z } from "zod";

export const sectionIds = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
] as const;

export const sectionIdSchema = z.enum(sectionIds);
export type SectionId = z.infer<typeof sectionIdSchema>;

export const templateIds = ["classic", "modern", "editorial"] as const;
export const templateIdSchema = z.enum(templateIds);
export type TemplateId = z.infer<typeof templateIdSchema>;

export const templateDescriptions: Record<TemplateId, { label: string; description: string }> = {
  classic: {
    label: "Classic",
    description: "One column, quiet type, easy for an applicant system to read.",
  },
  modern: {
    label: "Modern",
    description: "Tighter type with a teal accent.",
  },
  editorial: {
    label: "Editorial",
    description: "A large name and more room around each section.",
  },
};

const idSchema = z.string().trim().min(1).max(80);
const shortText = z.string().trim().max(240);
const longText = z.string().trim().max(4000);

const bulletSchema = z.strictObject({
  id: idSchema,
  text: longText,
});

const experienceSchema = z.strictObject({
  id: idSchema,
  company: shortText,
  role: shortText,
  location: shortText.optional(),
  startDate: shortText.optional(),
  endDate: shortText.nullable().optional(),
  isCurrent: z.boolean().optional(),
  bullets: z.array(bulletSchema).max(40),
});

const educationSchema = z.strictObject({
  id: idSchema,
  institution: shortText,
  qualification: shortText.optional(),
  field: shortText.optional(),
  startDate: shortText.optional(),
  endDate: shortText.optional(),
  details: z.array(longText).max(20).optional(),
});

const projectSchema = z.strictObject({
  id: idSchema,
  name: shortText,
  description: longText.optional(),
  technologies: z.array(shortText).max(30),
  bullets: z.array(longText).max(20),
  url: shortText.optional(),
});

const skillGroupSchema = z.strictObject({
  id: idSchema,
  category: shortText,
  items: z.array(shortText).max(40),
});

const certificationSchema = z.strictObject({
  id: idSchema,
  name: shortText,
  issuer: shortText.optional(),
  date: shortText.optional(),
  url: shortText.optional(),
});

export const cvDocumentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: idSchema,
  ownerId: idSchema,
  title: shortText.min(1),
  locale: z.string().trim().min(2).max(16),
  targetRole: shortText.optional(),
  contact: z.strictObject({
    fullName: shortText,
    email: z.union([z.literal(""), z.email()]).optional(),
    phone: shortText.optional(),
    location: shortText.optional(),
    links: z
      .array(
        z.strictObject({
          id: idSchema,
          label: shortText,
          url: shortText,
        }),
      )
      .max(12),
  }),
  summary: longText.optional(),
  experience: z.array(experienceSchema).max(30),
  education: z.array(educationSchema).max(20),
  projects: z.array(projectSchema).max(20),
  skills: z.array(skillGroupSchema).max(20),
  certifications: z.array(certificationSchema).max(20),
  sectionOrder: z
    .array(sectionIdSchema)
    .length(sectionIds.length)
    .refine((order) => new Set(order).size === sectionIds.length, {
      message: "section order must include each section once",
    }),
  templateId: templateIdSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CVDocument = z.infer<typeof cvDocumentSchema>;
export type ExperienceEntry = CVDocument["experience"][number];
export type EducationEntry = CVDocument["education"][number];
export type ProjectEntry = CVDocument["projects"][number];
export type SkillGroup = CVDocument["skills"][number];
export type CertificationEntry = CVDocument["certifications"][number];

export function parseCvDocument(input: unknown): CVDocument {
  return cvDocumentSchema.parse(input);
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
