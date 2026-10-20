export const productStatus = {
  voice:
    "Dictation and voice commands are not available yet. They arrive in a later checkpoint.",
  import:
    "Importing an existing CV is not available yet. You can still start from the studio shell.",
  export: "Export PDF downloads the CV on screen. The file is not kept after it is sent.",
  account:
    "Without an account, this CV is saved in this browser only. Sign in to keep it on your account.",
  editing:
    "Field editing is not available yet. The next checkpoint adds the CV schema and a local editor.",
} as const;

export const studioSections = [
  "Contact",
  "Summary",
  "Experience",
  "Education",
  "Projects",
  "Skills",
  "Certifications",
] as const;

export type StudioSection = (typeof studioSections)[number];
