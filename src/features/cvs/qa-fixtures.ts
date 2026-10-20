import { parseCvDocument, type CVDocument } from "@/features/cvs/schema";
import { sampleCv } from "@/features/cvs/fixtures";

const longBullet =
  "Shipped a measured improvement to a real system and wrote down only the work that happened.";

export const longCv: CVDocument = parseCvDocument({
  ...sampleCv,
  id: "cv_long_jose",
  title: "Staff engineer",
  targetRole: "Staff engineer",
  contact: {
    ...sampleCv.contact,
    fullName: "José Álvarez",
    email: "jose.alvarez@example.com",
    links: [
      {
        id: "link_long",
        label: "Notes",
        url: `https://example.com/${"research-notes/".repeat(8)}`.slice(0, 220),
      },
    ],
  },
  summary:
    "Builds internal tools and keeps the claims tied to work that actually shipped. This fixture is long on purpose so pagination can be checked.",
  experience: Array.from({ length: 8 }, (_, index) => ({
    id: `exp_long_${index}`,
    company:
      index === 0
        ? "Northwind Applied Research Laboratory for Internal Platforms"
        : `Harbor Systems ${index}`,
    role: "Staff engineer",
    location: "Dhaka",
    startDate: `201${index}`,
    endDate: index === 7 ? null : `201${index + 1}`,
    isCurrent: index === 7,
    bullets: Array.from({ length: 4 }, (_, bullet) => ({
      id: `bul_long_${index}_${bullet}`,
      text: `${longBullet} Item ${index}.${bullet}.`,
    })),
  })),
  projects: [
    {
      id: "proj_long",
      name: "Migration notes",
      description: "A dense list used to check wrapping.",
      technologies: ["TypeScript", "PostgreSQL", "Playwright"],
      bullets: [longBullet, longBullet],
      url: `https://example.com/${"very-long-path/".repeat(10)}`.slice(0, 220),
    },
  ],
  skills: [
    {
      id: "skill_long",
      category: "Engineering",
      items: ["TypeScript", "PostgreSQL", "Testing", "Accessibility", "Writing"],
    },
  ],
});

export const sparseCv: CVDocument = parseCvDocument({
  ...sampleCv,
  id: "cv_sparse",
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
});
