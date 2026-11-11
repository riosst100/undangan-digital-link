import { apiFetch, apiFetchBlob } from "./client";
import type { TahlilInvitationInput, TahlilStatus, TahlilSubmission, TahlilSubmissionInput } from "@/types/tahlil";

const ADMIN_BASE = "/api/admin/tahlil-submissions";

/** Public form: store the data for an admin to process. */
export async function submitTahlilInvitation(input: TahlilSubmissionInput): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/api/public/tahlil-submissions", { method: "POST", body: input });
}

/** Admin: render a PDF from (possibly unsaved) form data. */
export async function previewTahlilPdf(input: TahlilInvitationInput) {
  return apiFetchBlob("/api/admin/tahlil-invitations/pdf", { method: "POST", body: input });
}

/** Admin: render a PDF from a submission's saved data. */
export async function downloadTahlilSubmissionPdf(id: string) {
  return apiFetchBlob(`${ADMIN_BASE}/${encodeURIComponent(id)}/pdf`, { cache: "no-store" });
}

/** Admin: save a drafted invitation (first PDF generation). */
export async function createTahlilSubmission(input: TahlilSubmissionInput & { status?: TahlilStatus }): Promise<TahlilSubmission> {
  return apiFetch<TahlilSubmission>(ADMIN_BASE, { method: "POST", body: input });
}

export type CsvImportResult = { created: number; updated: number; errors: { row: number; message: string }[] };

/** Admin: download the list (optionally one status) or an empty template as CSV. */
export async function exportTahlilCsv(options: { status?: TahlilStatus | null; template?: boolean } = {}) {
  const query = new URLSearchParams();
  if (options.status) query.set("status", options.status);
  if (options.template) query.set("template", "1");
  const qs = query.toString();
  return apiFetchBlob(`${ADMIN_BASE}/export${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

/** Admin: create/update invitations from a CSV file. */
export async function importTahlilCsv(file: File): Promise<CsvImportResult> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<CsvImportResult>(`${ADMIN_BASE}/import`, { method: "POST", body });
}

export async function updateTahlilSubmission(
  id: string,
  input: TahlilSubmissionInput & { status: TahlilStatus },
): Promise<TahlilSubmission> {
  return apiFetch<TahlilSubmission>(`${ADMIN_BASE}/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export async function deleteTahlilSubmission(id: string): Promise<void> {
  await apiFetch<null>(`${ADMIN_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
