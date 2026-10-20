"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic } from "lucide-react";
import { CvPreview } from "@/components/resume/cv-preview";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { CvEditor } from "@/components/workspace/cv-editor";
import { setTemplate } from "@/features/cvs/edits";
import { createHistory, pushHistory, redo, undo, type EditorHistory } from "@/features/cvs/history";
import { sampleCv } from "@/features/cvs/fixtures";
import { loadStoredCv, saveStoredCv } from "@/features/cvs/storage";
import { templateDescriptions, templateIds, type CVDocument, type SectionId } from "@/features/cvs/schema";
import { productStatus } from "@/lib/product-status";

const panels = [
  { id: "editor", label: "Editor" },
  { id: "preview", label: "Preview" },
  { id: "library", label: "CVs" },
] as const;

type PanelId = (typeof panels)[number]["id"];
type AccountPhase = "guest" | "loading" | "error" | "empty" | "ready";
type SaveState = "saved" | "saving" | "error" | "conflict";

type CvListItem = {
  id: string;
  title: string;
  revision: number;
  updatedAt: string;
};

type StoredCv = CvListItem & { document: CVDocument };

export function StudioShell() {
  return (
    <ToastProvider>
      <StudioWorkspace />
    </ToastProvider>
  );
}

function StudioWorkspace() {
  const [panel, setPanel] = useState<PanelId>("editor");
  const [section, setSection] = useState<SectionId | "contact">("summary");
  const [history, setHistory] = useState<EditorHistory>(() => createHistory(loadStoredCv()));
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "loading" | "error">("idle");
  const [accountPhase, setAccountPhase] = useState<AccountPhase>("guest");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [cvList, setCvList] = useState<CvListItem[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [accountError, setAccountError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const accountRef = useRef<{ activeId: string; revision: number } | null>(null);
  const lastSaved = useRef<string | null>(null);
  const { notify } = useToast();
  const cv = history.present;

  useEffect(() => {
    if (accountPhase === "guest" || accountPhase === "empty") {
      saveStoredCv(history.present);
    }
  }, [accountPhase, history]);

  const rememberServerCv = useCallback((record: StoredCv) => {
    lastSaved.current = JSON.stringify(record.document);
    accountRef.current = { activeId: record.id, revision: record.revision };
    setActiveId(record.id);
    setHistory(createHistory(record.document));
    setSaveState("saved");
    setAccountPhase("ready");
  }, []);

  const openServerCv = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/cvs/${id}`);
      if (!response.ok) {
        setAccountError("That CV was not found.");
        setAccountPhase("error");
        return;
      }
      const body = (await response.json()) as { cv: StoredCv };
      rememberServerCv(body.cv);
    },
    [rememberServerCv],
  );

  const refreshLibrary = useCallback(
    async (cancelled = false) => {
      try {
        const response = await fetch("/api/cvs");
        if (!response.ok) throw new Error("list");
        const body = (await response.json()) as { cvs: CvListItem[] };
        if (cancelled) return;
        setCvList(body.cvs);
        if (body.cvs.length === 0) {
          accountRef.current = null;
          setActiveId(null);
          setAccountPhase("empty");
          return;
        }
        await openServerCv(body.cvs[0].id);
      } catch {
        if (!cancelled) {
          setAccountError("Your CVs did not load.");
          setAccountPhase("error");
        }
      }
    },
    [openServerCv],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadAccount() {
      let email: string | null = null;
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;
        const body = (await response.json()) as { user: { email: string } | null };
        email = body.user?.email ?? null;
      } catch {
        return;
      }
      if (cancelled || !email) return;
      setAccountEmail(email);
      setAccountPhase("loading");
      await refreshLibrary(cancelled);
    }
    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, [refreshLibrary]);

  const saveAccountCv = useCallback(async (document: CVDocument) => {
    const current = accountRef.current;
    if (!current) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/cvs/${current.activeId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ revision: current.revision, document }),
      });
      if (response.status === 409) {
        setSaveState("conflict");
        return;
      }
      if (!response.ok) {
        setSaveState("error");
        return;
      }
      const body = (await response.json()) as { cv: StoredCv };
      current.revision = body.cv.revision;
      lastSaved.current = JSON.stringify(document);
      setSaveState("saved");
      setCvList((items) =>
        items.map((item) =>
          item.id === current.activeId
            ? { ...item, title: document.title, revision: body.cv.revision, updatedAt: body.cv.updatedAt }
            : item,
        ),
      );
    } catch {
      setSaveState("error");
    }
  }, []);

  useEffect(() => {
    if (accountPhase !== "ready" || !accountRef.current) return;
    const snapshot = JSON.stringify(history.present);
    if (snapshot === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      void saveAccountCv(history.present);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [accountPhase, history, saveAccountCv]);

  async function createOnServer(document: CVDocument) {
    setAccountPhase("loading");
    try {
      const response = await fetch("/api/cvs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ document }),
      });
      if (!response.ok) throw new Error("create");
      const body = (await response.json()) as { cv: StoredCv };
      setCvList((items) => [body.cv, ...items.filter((item) => item.id !== body.cv.id)]);
      rememberServerCv(body.cv);
    } catch {
      setAccountError("That CV was not saved to your account.");
      setAccountPhase("error");
    }
  }

  async function duplicateActive() {
    const id = accountRef.current?.activeId;
    if (!id) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/cvs/${id}/duplicate`, { method: "POST" });
      if (!response.ok) throw new Error("duplicate");
      const body = (await response.json()) as { cv: StoredCv };
      setCvList((items) => [body.cv, ...items]);
      rememberServerCv(body.cv);
    } catch {
      setSaveState("error");
    }
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    accountRef.current = null;
    lastSaved.current = null;
    setActiveId(null);
    setAccountEmail(null);
    setCvList([]);
    setAccountError("");
    setSaveState("saved");
    setHistory(createHistory(loadStoredCv()));
    setAccountPhase("guest");
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = panels.findIndex((item) => item.id === panel);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = panels[(current + direction + panels.length) % panels.length];
    setPanel(next.id);
    document.getElementById(`studio-tab-${next.id}`)?.focus();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <Link href="/" className="serif text-xl">
          VoxCV
        </Link>
        <p className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
          {accountLabel(accountPhase, saveState)}
        </p>
        <div className="flex gap-2">
          {accountEmail ? (
            <Button variant="ghost" onClick={() => void signOut()}>
              Sign out
            </Button>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
            >
              Sign in
            </Link>
          )}
          <Button
            variant="secondary"
            disabled={history.past.length === 0}
            onClick={() => setHistory((current) => undo(current))}
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            disabled={history.future.length === 0}
            onClick={() => setHistory((current) => redo(current))}
          >
            Redo
          </Button>
          <Button variant="ghost" onClick={() => setAboutOpen(true)}>
            About saving
          </Button>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Studio panels"
        className="flex gap-2 border-b border-line px-4 py-2 lg:hidden"
        onKeyDown={onTabKeyDown}
      >
        {panels.map((item) => (
          <button
            key={item.id}
            id={`studio-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={panel === item.id}
            aria-controls={`studio-panel-${item.id}`}
            tabIndex={panel === item.id ? 0 : -1}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${panel === item.id ? "bg-ink text-paper-raised" : "text-ink-soft"}`}
            onClick={() => setPanel(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)_22rem]">
        <aside
          id="studio-panel-library"
          role="tabpanel"
          aria-label="CV library"
          className={`${panel === "library" ? "block" : "hidden"} border-line lg:block lg:border-r`}
        >
          <Library
            title={cv.title}
            activeId={activeId}
            phase={accountPhase}
            email={accountEmail}
            cvs={cvList}
            error={accountError}
            onOpenEditor={() => setPanel("editor")}
            onOpenCv={(id) => void openServerCv(id)}
            onSaveLocal={() => void createOnServer(cv)}
            onCreate={() => void createOnServer({ ...sampleCv, title: "Untitled CV" })}
            onDuplicate={() => void duplicateActive()}
            onRetry={() => {
              setAccountPhase("loading");
              void refreshLibrary();
            }}
            onReloadActive={() => {
              const id = accountRef.current?.activeId;
              if (id) void openServerCv(id);
            }}
            saveState={saveState}
          />
        </aside>
        <section
          id="studio-panel-editor"
          role="tabpanel"
          aria-label="Editor"
          className={`${panel === "editor" ? "flex" : "hidden"} min-h-[50vh] flex-col gap-4 overflow-auto p-4 lg:flex`}
        >
          <CvEditor
            document={cv}
            section={section}
            onSection={setSection}
            onChange={(next) => setHistory((current) => pushHistory(current, next))}
          />
        </section>
        <aside
          id="studio-panel-preview"
          role="tabpanel"
          aria-label="CV preview"
          className={`${panel === "preview" ? "block" : "hidden"} overflow-auto border-line p-4 lg:block lg:border-l`}
        >
          <div className="mb-3 grid gap-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">Template</p>
            <div className="flex flex-wrap gap-2">
              {templateIds.map((templateId) => (
                <button
                  key={templateId}
                  type="button"
                  aria-pressed={cv.templateId === templateId}
                  className={`rounded-full px-3 py-1 text-sm ${cv.templateId === templateId ? "bg-ink text-paper-raised" : "border border-line bg-paper-raised"}`}
                  onClick={() =>
                    setHistory((current) => pushHistory(current, setTemplate(current.present, templateId)))
                  }
                >
                  {templateDescriptions[templateId].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-soft">{templateDescriptions[cv.templateId].description}</p>
          </div>
          <CvPreview document={cv} />
        </aside>
      </div>

      <div className="sticky bottom-0 border-t border-line bg-paper px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Mic aria-hidden="true" className="text-ink-soft" />
            <div>
              <p className="text-sm font-semibold">Voice</p>
              <p id="voice-status" className="text-sm text-ink-soft">
                {productStatus.voice}
              </p>
              {exportState === "error" ? (
                <p id="export-status" className="text-sm text-danger" role="alert">
                  The PDF did not export. Your CV is still here.
                </p>
              ) : (
                <p id="export-status" className="text-sm text-ink-soft">
                  {exportState === "loading" ? "Preparing the PDF…" : "The PDF uses the CV on screen."}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled aria-describedby="voice-status">
              Start dictation
            </Button>
            <Button
              variant="secondary"
              aria-describedby="export-status"
              disabled={exportState === "loading"}
              onClick={() => void exportPdf(cv, setExportState)}
            >
              {exportState === "loading" ? "Preparing PDF…" : exportState === "error" ? "Try export again" : "Export PDF"}
            </Button>
          </div>
        </div>
      </div>

      {aboutOpen ? (
        <Dialog
          open
          title={accountEmail ? "Saved to your account" : "Saved in this browser"}
          onClose={() => {
            setAboutOpen(false);
            notify(accountEmail ? "This CV is saved to your account." : productStatus.account);
          }}
        >
          <p>
            {accountEmail
              ? `Signed in as ${accountEmail}. Edits save to your account. Someone else's CV id will not open their document.`
              : productStatus.account}
          </p>
        </Dialog>
      ) : null}
    </div>
  );
}

async function exportPdf(
  cv: CVDocument,
  setExportState: (state: "idle" | "loading" | "error") => void,
) {
  setExportState("loading");
  try {
    const response = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cv),
    });
    if (!response.ok) {
      setExportState("error");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const match = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/);
    link.href = url;
    link.download = match?.[1] ?? "cv.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setExportState("idle");
  } catch {
    setExportState("error");
  }
}

function accountLabel(phase: AccountPhase, saveState: SaveState) {
  if (phase === "guest" || phase === "empty") return "This browser";
  if (phase === "loading") return "Loading";
  if (phase === "error") return "Account error";
  if (saveState === "saving") return "Saving";
  if (saveState === "conflict") return "Reload to save";
  if (saveState === "error") return "Not saved";
  return "Saved";
}

function Library({
  title,
  activeId,
  phase,
  email,
  cvs,
  error,
  saveState,
  onOpenEditor,
  onOpenCv,
  onSaveLocal,
  onCreate,
  onDuplicate,
  onRetry,
  onReloadActive,
}: {
  title: string;
  activeId: string | null;
  phase: AccountPhase;
  email: string | null;
  cvs: CvListItem[];
  error: string;
  saveState: SaveState;
  onOpenEditor: () => void;
  onOpenCv: (id: string) => void;
  onSaveLocal: () => void;
  onCreate: () => void;
  onDuplicate: () => void;
  onRetry: () => void;
  onReloadActive: () => void;
}) {
  return (
    <div className="grid gap-4 p-4">
      <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">CVs</h2>
      {phase === "loading" ? <p className="text-sm text-ink-soft">Loading your CVs…</p> : null}
      {phase === "error" ? (
        <div className="grid gap-2">
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
      {phase === "guest" ? (
        <>
          <button
            type="button"
            className="rounded-2xl border border-accent/40 bg-accent-soft p-3 text-left"
            onClick={onOpenEditor}
          >
            <span className="block text-sm font-semibold">{title}</span>
            <span className="text-xs text-ink-soft">Saved in this browser</span>
          </button>
          <p className="text-sm text-ink-soft">{productStatus.account}</p>
        </>
      ) : null}
      {phase === "empty" ? (
        <div className="grid gap-3">
          <p className="text-sm text-ink-soft">No CVs in this account yet. The one on screen is still in this browser.</p>
          <Button onClick={onSaveLocal}>Save this CV to your account</Button>
        </div>
      ) : null}
      {phase === "ready" ? (
        <div className="grid gap-2">
          <p className="text-xs text-ink-soft">{email}</p>
          {cvs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-2xl border p-3 text-left ${item.id === activeId ? "border-accent/40 bg-accent-soft" : "border-line bg-paper-raised"}`}
              onClick={() => onOpenCv(item.id)}
            >
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="text-xs text-ink-soft">
                {item.id === activeId ? accountLabel(phase, saveState) : "Saved"}
              </span>
            </button>
          ))}
          {saveState === "conflict" ? (
            <Button variant="secondary" onClick={onReloadActive}>
              Reload this CV
            </Button>
          ) : null}
          {saveState === "error" ? (
            <p className="text-sm text-danger" role="alert">
              The last edit did not save.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onCreate}>
              New CV
            </Button>
            <Button variant="secondary" onClick={onDuplicate}>
              Duplicate
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
