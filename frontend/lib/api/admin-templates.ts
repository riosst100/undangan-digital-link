import { apiFetch } from "./client";
import type { AdminTemplate, CreateTemplateInput } from "@/types/admin-template";

export async function getAdminTemplates(): Promise<AdminTemplate[]> {
  return apiFetch<AdminTemplate[]>("/api/admin/templates", { cache: "no-store" });
}

export async function createTemplate(input: CreateTemplateInput): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>("/api/admin/templates", { method: "POST", body: input });
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch<null>(`/api/admin/templates/${id}`, { method: "DELETE" });
}
