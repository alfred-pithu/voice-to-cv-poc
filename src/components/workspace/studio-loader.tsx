"use client";

import dynamic from "next/dynamic";

const StudioShell = dynamic(
  () => import("@/components/workspace/studio-shell").then((mod) => mod.StudioShell),
  {
    ssr: false,
    loading: () => (
      <p className="grid min-h-dvh place-items-center text-sm text-ink-soft">
        Loading the studio…
      </p>
    ),
  },
);

export function StudioLoader() {
  return <StudioShell />;
}
