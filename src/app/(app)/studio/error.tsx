"use client";

import { Button } from "@/components/ui/button";

export default function StudioError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-lg place-content-center gap-4 px-4">
      <h1 className="serif text-3xl">The studio could not be displayed</h1>
      <p className="text-sm text-ink-soft">
        Try again. If it keeps failing, nothing in your demo view was saved.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
