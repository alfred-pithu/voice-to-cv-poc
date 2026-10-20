import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const describedBy = [
    hint ? `${fieldId}-hint` : null,
    error ? `${fieldId}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="rounded-xl border border-line bg-paper-raised px-3 py-2 text-base text-ink placeholder:text-ink-soft disabled:cursor-not-allowed disabled:bg-paper"
        {...props}
      />
      {hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Notice({
  tone = "warning",
  children,
}: {
  tone?: "warning" | "danger";
  children: ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-danger/30 bg-danger-soft text-danger"
      : "border-warning/30 bg-warning-soft text-warning";

  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>
      {children}
    </p>
  );
}
