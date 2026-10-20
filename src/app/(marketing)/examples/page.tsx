import type { Metadata } from "next";

export const metadata: Metadata = { title: "Examples" };

const examples = [
  {
    name: "Amina Rahman",
    role: "Product designer",
    note: "A short CV used as the studio demo. Not a real person.",
  },
  {
    name: "Jules Okonkwo",
    role: "Backend engineer",
    note: "A longer sample will be used later to test page breaks.",
  },
];

export default function ExamplesPage() {
  return (
    <main id="main" className="mx-auto grid max-w-3xl gap-6 px-4 py-16">
      <h1 className="serif text-4xl">Examples</h1>
      <p className="text-ink-soft">
        These are invented samples for layout. They are not customer CVs.
      </p>
      <ul className="grid gap-4">
        {examples.map((example) => (
          <li
            key={example.name}
            className="rounded-3xl border border-line bg-paper-raised p-6"
          >
            <h2 className="serif text-2xl">{example.name}</h2>
            <p className="text-sm font-semibold">{example.role}</p>
            <p className="mt-2 text-sm text-ink-soft">{example.note}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
