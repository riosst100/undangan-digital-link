import { apiFetch } from "./client";
import type { CustomerInvitation, Guest } from "@/types/guestbook";

const base = (invitationId: string) => `/api/customer/invitations/${encodeURIComponent(invitationId)}`;

export async function listGuests(invitationId: string): Promise<Guest[]> {
  return apiFetch<Guest[]>(`${base(invitationId)}/guests`, { cache: "no-store" });
}

export async function createGuest(invitationId: string, name: string): Promise<Guest> {
  return apiFetch<Guest>(`${base(invitationId)}/guests`, { method: "POST", body: { name } });
}

export async function updateGuest(invitationId: string, guestId: string, name: string): Promise<Guest> {
  return apiFetch<Guest>(`${base(invitationId)}/guests/${encodeURIComponent(guestId)}`, {
    method: "PATCH",
    body: { name },
  });
}

export async function deleteGuest(invitationId: string, guestId: string): Promise<void> {
  await apiFetch<null>(`${base(invitationId)}/guests/${encodeURIComponent(guestId)}`, { method: "DELETE" });
}

export async function updateShareMessage(
  invitationId: string,
  input: { shareTemplate: string; shareMessage: string },
): Promise<CustomerInvitation> {
  return apiFetch<CustomerInvitation>(base(invitationId), {
    method: "PATCH",
    body: { share_template: input.shareTemplate, share_message: input.shareMessage },
  });
}
