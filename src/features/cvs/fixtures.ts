import type { CVDocument, SectionId } from "@/features/cvs/schema";

export const sampleCv: CVDocument = {
  schemaVersion: 1,
  id: "cv_sample_amina",
  ownerId: "local",
  title: "Product designer",
  locale: "en",
  targetRole: "Product designer",
  contact: {
    fullName: "Amina Rahman",
    email: "amina.rahman@example.com",
    phone: "+880 1700 000000",
    location: "Dhaka",
    links: [
      {
        id: "link_portfolio",
        label: "Portfolio",
        url: "https://example.com/amina",
      },
    ],
  },
  summary:
    "Designs hiring tools that stay calm under pressure. This sample is a starting point stored in this browser.",
  experience: [
    {
      id: "exp_northwind",
      company: "Northwind Studio",
      role: "Product designer",
      location: "Dhaka",
      startDate: "2022-03",
      endDate: null,
      isCurrent: true,
      bullets: [
        {
          id: "bul_northwind_1",
          text: "Led the careers-site redesign.",
        },
      ],
    },
  ],
  education: [
    {
      id: "edu_buet",
      institution: "Bangladesh University of Engineering and Technology",
      qualification: "B.Sc.",
      field: "Industrial design",
      endDate: "2021",
    },
  ],
  projects: [
    {
      id: "proj_voice_notes",
      name: "Field notes",
      description: "A personal archive of interview observations.",
      technologies: ["Figma"],
      bullets: ["Mapped how candidates recover from a bad form."],
      url: "https://example.com/notes",
    },
  ],
  skills: [
    {
      id: "skill_design",
      category: "Design",
      items: ["Research", "Interface design", "Prototyping"],
    },
  ],
  certifications: [
    {
      id: "cert_nng",
      name: "UX Certification",
      issuer: "Nielsen Norman Group",
      date: "2023",
    },
  ],
  sectionOrder: [
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
  ],
  templateId: "classic",
  createdAt: "2026-10-20T00:00:00.000Z",
  updatedAt: "2026-10-20T00:00:00.000Z",
};

export const sectionLabels: Record<SectionId | "contact", string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
};
