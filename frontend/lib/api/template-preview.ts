import { apiFetch } from "./client";
import type { TemplatePreview } from "@/types/template-preview";

export async function getTemplatePreview(slug: string): Promise<TemplatePreview> {
  return apiFetch<TemplatePreview>(`/api/public/templates/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
}
