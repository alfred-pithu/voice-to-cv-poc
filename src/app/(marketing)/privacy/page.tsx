import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto grid max-w-2xl gap-4 px-4 py-16 text-sm leading-7">
      <h1 className="serif text-4xl">Privacy</h1>
      <p>
        You can use the studio without an account. That CV stays in this browser.
        If you create an account, the password is stored as a hash and the session
        lives in an httpOnly cookie. Each CV is readable only by the person who
        owns it.
      </p>
      <p>
        When voice ships, recording starts only after you choose it. Raw audio is
        not kept by default. Exporting a PDF sends the CV you are editing to
        this app so it can build the file, and that file is not stored afterward.
      </p>
      <p>
        Voice is not live, so this build does not send audio to a speech provider.
        A guessed document id does not reveal whether someone else has that CV.
      </p>
    </main>
  );
}
