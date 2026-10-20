import Link from "next/link";
import { Mic, Eye, Undo2 } from "lucide-react";

const points = [
  {
    icon: Mic,
    title: "Talk into a field",
    body: "Dictate a bullet or a summary, then correct the transcript before it lands.",
  },
  {
    icon: Eye,
    title: "See the change first",
    body: "A spoken command proposes a specific edit. You accept it, reject it, or undo it.",
  },
  {
    icon: Undo2,
    title: "Keep the facts yours",
    body: "Wording can get sharper. Employers, dates, and metrics are never invented.",
  },
];

export default function HomePage() {
  return (
    <main id="main">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
        <div className="grid gap-6">
          <p className="text-sm font-semibold tracking-[0.16em] text-accent uppercase">
            Voice-first CV studio
          </p>
          <h1 className="serif text-5xl leading-[1.05] text-balance sm:text-6xl">
            Build and update your CV by talking.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-ink-soft">
            A live preview, ordinary controls, and a chance to accept or undo
            every change. Voice is optional. The document stays structured.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-paper-raised hover:bg-accent-strong"
            >
              Build my CV
            </Link>
            <Link
              href="/import"
              className="rounded-full border border-line bg-paper-raised px-5 py-3 text-sm font-semibold hover:border-ink/30"
            >
              Import an existing CV
            </Link>
          </div>
          <p className="max-w-xl rounded-2xl border border-line bg-paper-raised px-4 py-3 text-sm text-ink-soft">
            Early build: you can edit a CV, save it to an account, and export a PDF. Voice
            is not ready yet.
          </p>
        </div>
        <article
          aria-label="Sample CV preview"
          className="rounded-[2rem] border border-line bg-paper-raised p-8 shadow-sm"
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
            Sample preview
          </p>
          <h2 className="serif mt-3 text-3xl">Amina Rahman</h2>
          <p className="mt-1 text-sm text-ink-soft">Product designer · Dhaka</p>
          <p className="mt-5 text-sm leading-6">
            Designs hiring tools that stay calm under pressure. This sample is
            illustrative and is not a saved CV.
          </p>
          <h3 className="mt-6 text-xs font-semibold tracking-[0.14em] uppercase">
            Experience
          </h3>
          <p className="mt-2 text-sm font-semibold">Northwind Studio</p>
          <p className="text-sm text-ink-soft">Led the careers-site redesign.</p>
        </article>
      </section>
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {points.map((point) => (
            <article key={point.title} className="grid gap-3">
              <point.icon aria-hidden="true" className="text-accent" />
              <h2 className="serif text-2xl">{point.title}</h2>
              <p className="text-sm leading-6 text-ink-soft">{point.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
