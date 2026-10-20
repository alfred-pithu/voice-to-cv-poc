import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main id="main" className="mx-auto grid max-w-md gap-6 px-4 py-16">
      <div className="grid gap-2">
        <h1 className="serif text-4xl">Sign in</h1>
        <p className="text-sm leading-6 text-ink-soft">
          Your CVs stay private to this account. A guest CV in this browser stays here until you save it.
        </p>
      </div>
      <AuthForm mode="sign-in" />
    </main>
  );
}
