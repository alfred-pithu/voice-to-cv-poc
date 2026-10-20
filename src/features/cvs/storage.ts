import { parseCvDocument, type CVDocument } from "@/features/cvs/schema";
import { sampleCv } from "@/features/cvs/fixtures";

export const localCvKey = "voxcv.cv.v1";

export function loadStoredCv(storage: Storage | null = browserStorage()): CVDocument {
  if (!storage) return sampleCv;
  const raw = storage.getItem(localCvKey);
  if (!raw) return sampleCv;
  try {
    return parseCvDocument(JSON.parse(raw));
  } catch {
    return sampleCv;
  }
}

export function saveStoredCv(document: CVDocument, storage: Storage | null = browserStorage()) {
  storage?.setItem(localCvKey, JSON.stringify(parseCvDocument(document)));
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    if (typeof storage?.getItem !== "function" || typeof storage.setItem !== "function") {
      return null;
    }
    return storage;
  } catch {
    return null;
  }
}
