import Link from "next/link";

const links = [
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="serif text-xl tracking-tight">
          VoxCV
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" className="text-sm text-ink-soft hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/studio"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper-raised hover:bg-accent-strong"
          >
            Build my CV
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:justify-between">
        <p>VoxCV — a voice-first CV studio.</p>
        <p>Early build. Voice is not live yet.</p>
      </div>
    </footer>
  );
}
