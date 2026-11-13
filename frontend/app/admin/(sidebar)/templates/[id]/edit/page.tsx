import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server-fetch";
import { EditTemplateForm } from "@/components/admin/EditTemplateForm";
import type { AdminTemplate } from "@/types/admin-template";

export const metadata = { title: "Edit Template — Admin" };

export default async function EditTemplatePage({ params }: PageProps<"/admin/templates/[id]/edit">) {
  const { id } = await params;
  const template = await serverFetch<AdminTemplate>(`/api/admin/templates/${encodeURIComponent(id)}`);
  if (!template) notFound();

  return (
    <div>
      <Link href="/admin/templates" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Templates
      </Link>
      <h1 className="mt-2 text-2xl font-medium text-zinc-900">Edit {template.name}</h1>
      <p className="mt-1 text-sm text-zinc-600">{template.slug}</p>

      <EditTemplateForm template={template} />
    </div>
  );
}
