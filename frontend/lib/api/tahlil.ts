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

export async function updateTahlilSubmission(
  id: string,
  input: TahlilSubmissionInput & { status: TahlilStatus },
): Promise<TahlilSubmission> {
  return apiFetch<TahlilSubmission>(`${ADMIN_BASE}/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export async function deleteTahlilSubmission(id: string): Promise<void> {
  await apiFetch<null>(`${ADMIN_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
