"use client";

import { GripVertical } from "lucide-react";
import { useState } from "react";
import { reorderDrag } from "@/features/cvs/edits";
import { sectionLabels } from "@/features/cvs/fixtures";
import type { SectionId } from "@/features/cvs/schema";

type SectionOrderProps = {
  order: SectionId[];
  active: SectionId | "contact";
  onSelect: (section: SectionId | "contact") => void;
  onReorder: (order: SectionId[]) => void;
};

export function SectionOrder({ order, active, onSelect, onReorder }: SectionOrderProps) {
  const [dragging, setDragging] = useState<SectionId | null>(null);
  const [over, setOver] = useState<SectionId | null>(null);

  function dropOn(target: SectionId, from: SectionId | null) {
    if (!from) return;
    const next = reorderDrag(order, from, target);
    if (next.join() !== order.join()) onReorder(next);
    setDragging(null);
    setOver(null);
  }

  return (
    <div className="grid gap-2">
      <p id="section-order-label" className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
        Sections
      </p>
      <button
        type="button"
        aria-current={active === "contact" ? "true" : undefined}
        className={`rounded-2xl border px-3 py-2 text-left text-sm ${active === "contact" ? "border-accent bg-accent-soft font-semibold text-accent-strong" : "border-line bg-paper-raised"}`}
        onClick={() => onSelect("contact")}
      >
        Contact
        <span className="mt-0.5 block text-xs font-normal text-ink-soft">Stays at the top</span>
      </button>
      <ul aria-labelledby="section-order-label" className="grid gap-1">
        {order.map((sectionId, index) => {
          const label = sectionLabels[sectionId];
          const isOver = over === sectionId && dragging !== null && dragging !== sectionId;
          return (
            <li
              key={sectionId}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", sectionId);
                event.dataTransfer.effectAllowed = "move";
                setDragging(sectionId);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOver(sectionId);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from = (event.dataTransfer.getData("text/plain") || dragging) as SectionId | null;
                dropOn(sectionId, from);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={`flex items-center gap-1 rounded-2xl border bg-paper-raised pr-2 ${isOver ? "border-accent" : "border-line"} ${dragging === sectionId ? "opacity-50" : ""}`}
            >
              <span
                role="button"
                tabIndex={0}
                draggable
                aria-label={`Reorder ${label}`}
                aria-keyshortcuts="ArrowUp ArrowDown"
                className="cursor-grab rounded-xl p-2 text-ink-soft active:cursor-grabbing"
                onKeyDown={(event) => {
                  const neighbor =
                    event.key === "ArrowUp" ? order[index - 1] : event.key === "ArrowDown" ? order[index + 1] : null;
                  if (!neighbor) return;
                  event.preventDefault();
                  onReorder(reorderDrag(order, sectionId, neighbor));
                }}
              >
                <GripVertical aria-hidden="true" className="size-4" />
              </span>
              <button
                type="button"
                aria-current={active === sectionId ? "true" : undefined}
                className={`flex-1 py-2 text-left text-sm ${active === sectionId ? "font-semibold text-accent-strong" : ""}`}
                onClick={() => onSelect(sectionId)}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-5 text-ink-soft">
        Drag a section to move it. From the handle, the arrow keys do the same thing.
      </p>
    </div>
  );
}
