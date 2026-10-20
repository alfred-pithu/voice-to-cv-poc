import type { Metadata } from "next";
import { Notice, TextField } from "@/components/ui/input";
import { productStatus } from "@/lib/product-status";

export const metadata: Metadata = { title: "Import a CV" };

export default function ImportPage() {
  return (
    <main id="main" className="mx-auto grid max-w-xl gap-6 px-4 py-16">
      <h1 className="serif text-4xl">Import an existing CV</h1>
      <Notice>{productStatus.import}</Notice>
      <TextField
        label="CV file"
        type="file"
        disabled
        hint="PDF and DOCX review will be added later. Nothing is uploaded from this page."
      />
    </main>
  );
}
