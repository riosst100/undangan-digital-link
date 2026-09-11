import { serverFetch } from "@/lib/api/server-fetch";
import { TemplateManager } from "@/components/admin/TemplateManager";
import type { AdminTemplate } from "@/types/admin-template";

export default async function AdminTemplatesPage() {
  const templates = (await serverFetch<AdminTemplate[]>("/api/admin/templates")) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-medium text-zinc-900">Templates</h1>
      <p className="mt-1 text-sm text-zinc-600">Kelola desain undangan yang tersedia untuk customer.</p>

      <TemplateManager initialTemplates={templates} />
    </div>
  );
}
