import type { CVDocument } from "@/features/cvs/schema";

export type EditorHistory = {
  past: CVDocument[];
  present: CVDocument;
  future: CVDocument[];
};

export function createHistory(present: CVDocument): EditorHistory {
  return { past: [], present, future: [] };
}

export function pushHistory(history: EditorHistory, next: CVDocument): EditorHistory {
  if (JSON.stringify(history.present) === JSON.stringify(next)) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: [],
  };
}

export function undo(history: EditorHistory): EditorHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: EditorHistory): EditorHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
