import { apiFetch } from "./client";
import type { TemplateCatalog } from "@/types/catalog";

export async function getTemplateCatalog(): Promise<TemplateCatalog> {
  return apiFetch<TemplateCatalog>("/api/public/templates/catalog", {
    next: { revalidate: 300 },
  });
}
