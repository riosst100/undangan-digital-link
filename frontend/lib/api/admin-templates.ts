import { apiFetch } from "./client";
import type { AdminTemplate, CreateTemplateInput, CreateTemplateThemeInput, UpdateTemplateInput } from "@/types/admin-template";

export async function getAdminTemplates(): Promise<AdminTemplate[]> {
  return apiFetch<AdminTemplate[]>("/api/admin/templates", { cache: "no-store" });
}

export async function createTemplate(input: CreateTemplateInput): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>("/api/admin/templates", { method: "POST", body: input });
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch<null>(`/api/admin/templates/${id}`, { method: "DELETE" });
}

export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>(`/api/admin/templates/${id}`, { method: "PATCH", body: input });
}

export async function uploadTemplateImages(id: string, files: File[]): Promise<AdminTemplate> {
  const body = new FormData();
  files.forEach((file) => body.append("images[]", file));
  return apiFetch<AdminTemplate>(`/api/admin/templates/${id}/images`, { method: "POST", body });
}

export async function deleteTemplateImage(id: string, path: string): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>(`/api/admin/templates/${id}/images`, { method: "DELETE", body: { path } });
}

export type SaveDesignInput = {
  sections: { type: string; variant: string; enabled: boolean; settings?: Record<string, string | number | boolean> }[];
  theme: CreateTemplateThemeInput;
};

export async function saveTemplateDesign(id: string, input: SaveDesignInput): Promise<AdminTemplate> {
  return apiFetch<AdminTemplate>(`/api/admin/templates/${id}/design`, { method: "PUT", body: input });
}
