"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const signingUp = mode === "sign-up";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(signingUp ? "/api/auth/sign-up" : "/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: signingUp ? displayName : undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "That did not work. Try again.");
        setPending(false);
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch {
      setError("The server did not answer. Try again.");
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
      {signingUp ? (
        <TextField
          label="Name"
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      ) : null}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete={signingUp ? "new-password" : "current-password"}
        required
        minLength={signingUp ? 8 : 1}
        hint={signingUp ? "At least 8 characters." : undefined}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Working…" : signingUp ? "Create account" : "Sign in"}
      </Button>
      <p className="text-sm text-ink-soft">
        {signingUp ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-ink">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-ink">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
