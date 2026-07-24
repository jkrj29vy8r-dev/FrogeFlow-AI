import type { Metadata } from "next";
import { CreateDocumentWizard } from "@/features/documents/components/create-document-wizard";
import type { DocumentType } from "@/types/database";

export const metadata: Metadata = {
  title: "New Document",
};

const VALID_TYPES: DocumentType[] = [
  "ebook",
  "pdf_guide",
  "workbook",
  "checklist",
  "lead_magnet",
  "landing_page",
  "sales_page",
  "product_description",
  "marketing_content",
  "social_post",
  "email_campaign",
];

interface NewPageProps {
  searchParams: Promise<{
    type?: string;
    title?: string;
    description?: string;
    audience?: string;
  }>;
}

export default async function NewPage({ searchParams }: NewPageProps) {
  const { type, title, description, audience } = await searchParams;
  const initialType = VALID_TYPES.includes(type as DocumentType)
    ? (type as DocumentType)
    : undefined;

  return (
    <div className="px-4 py-8 sm:px-6">
      <CreateDocumentWizard
        initialType={initialType}
        initialTitle={title}
        initialDescription={description}
        initialAudience={audience}
      />
    </div>
  );
}
