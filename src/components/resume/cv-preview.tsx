import { CvDocumentView } from "@/components/templates/cv-document-view";
import { templateCss } from "@/components/templates/template-css";
import type { CVDocument } from "@/features/cvs/schema";

export function CvPreview({ document }: { document: CVDocument }) {
  return (
    <div className="overflow-hidden rounded-sm bg-white shadow-sm">
      <style>{templateCss}</style>
      <div className="px-8 py-10">
        <CvDocumentView document={document} />
      </div>
    </div>
  );
}
