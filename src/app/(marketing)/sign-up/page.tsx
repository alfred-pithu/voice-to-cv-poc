import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <main id="main" className="mx-auto grid max-w-md gap-6 px-4 py-16">
      <div className="grid gap-2">
        <h1 className="serif text-4xl">Create an account</h1>
        <p className="text-sm leading-6 text-ink-soft">
          The password is stored as a hash. The session cookie cannot be read by page scripts.
        </p>
      </div>
      <AuthForm mode="sign-up" />
    </main>
  );
}
