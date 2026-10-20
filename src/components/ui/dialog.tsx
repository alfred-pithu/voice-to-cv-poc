"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Dialog({ open, title, children, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="w-[min(32rem,calc(100%-2rem))] rounded-3xl border border-line bg-paper-raised p-0 text-ink shadow-xl backdrop:bg-ink/40"
      onClose={onClose}
    >
      <div className="grid gap-4 p-6">
        <h2 id={titleId} className="serif text-2xl">
          {title}
        </h2>
        <div className="text-sm leading-6 text-ink-soft">{children}</div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </dialog>
  );
}
