import { apiFetch } from "./client";
import type { PublicInvitation } from "@/types/invitation";

export async function getPublicInvitation(slug: string, guestToken?: string): Promise<PublicInvitation> {
  const query = guestToken ? `?to=${encodeURIComponent(guestToken)}` : "";
  return apiFetch<PublicInvitation>(`/api/public/invitations/${encodeURIComponent(slug)}${query}`, {
    next: { revalidate: 60 },
  });
}

export type RsvpInput = {
  guestToken?: string;
  attendance: "attending" | "not_attending" | "maybe";
  guestCount: number;
  message?: string;
};

export async function submitRsvp(slug: string, input: RsvpInput): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/api/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
    method: "POST",
    body: {
      guest_token: input.guestToken,
      attendance: input.attendance,
      guest_count: input.guestCount,
      message: input.message,
    },
  });
}
