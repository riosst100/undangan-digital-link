import { apiFetch } from "./client";
import type { PublicInvitation } from "@/types/invitation";

export async function getPublicInvitation(slug: string, guestToken?: string): Promise<PublicInvitation> {
  const query = guestToken ? `?to=${encodeURIComponent(guestToken)}` : "";
  return apiFetch<PublicInvitation>(`/api/public/invitations/${encodeURIComponent(slug)}${query}`, {
    next: { revalidate: 60 },
  });
}
