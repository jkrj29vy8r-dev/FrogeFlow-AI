import type { Metadata } from "next";
import { TemplatesView } from "@/features/dashboard/components/templates-view";

export const metadata: Metadata = {
  title: "Templates",
};

export default function TemplatesPage() {
  return <TemplatesView />;
}
