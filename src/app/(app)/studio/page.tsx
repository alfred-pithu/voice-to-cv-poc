import type { Metadata } from "next";
import { StudioLoader } from "@/components/workspace/studio-loader";

export const metadata: Metadata = { title: "Studio" };

export default function StudioPage() {
  return (
    <main id="main">
      <StudioLoader />
    </main>
  );
}
