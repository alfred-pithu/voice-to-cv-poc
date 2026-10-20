import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const questions = [
  {
    q: "Do I have to use my voice?",
    a: "No. Every core action will also work with a keyboard and a pointer. Voice is an extra way in.",
  },
  {
    q: "Will the AI invent a job or a metric?",
    a: "It must not. It can tighten wording. Missing facts should become a question, not a made-up line.",
  },
  {
    q: "Can I export a PDF today?",
    a: "Yes. Export PDF in the studio downloads the CV you are editing. The file is not kept after it is sent.",
  },
  {
    q: "Is my CV saved?",
    a: "Yes. Signed out, it stays in this browser. Signed in, it is saved to your account and a guessed id will not open someone else's CV.",
  },
];

export default function FaqPage() {
  return (
    <main id="main" className="mx-auto grid max-w-2xl gap-4 px-4 py-16">
      <h1 className="serif text-4xl">FAQ</h1>
      {questions.map((item) => (
        <details
          key={item.q}
          className="rounded-2xl border border-line bg-paper-raised px-4 py-3"
        >
          <summary className="cursor-pointer font-semibold">{item.q}</summary>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{item.a}</p>
        </details>
      ))}
    </main>
  );
}
