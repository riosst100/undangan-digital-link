import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server-fetch";
import { TemplateBuilder } from "@/components/admin/builder/TemplateBuilder";
import type { AdminTemplate } from "@/types/admin-template";

export const metadata = { title: "Customize Template — Admin" };

export default async function CustomizeTemplatePage({ params }: PageProps<"/admin/templates/[id]/customize">) {
  const { id } = await params;
  const template = await serverFetch<AdminTemplate>(`/api/admin/templates/${encodeURIComponent(id)}`);
  if (!template || !template.latest_version || !template.theme) notFound();

  return <TemplateBuilder template={template} />;
}
