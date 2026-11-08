import type { TahlilInvitationInput, TahlilSubmission, TahlilSubmissionInput } from "@/types/tahlil";

export const MAX_VENUE_LINES = 2;

/** Mirrors the backend caps: public submissions vs. the admin tool. */
export const MAX_GUESTS = { public: 50, admin: 200 } as const;

/** Form-friendly shape: guests edited as one name per line. */
export type TahlilFormState = Omit<TahlilSubmissionInput, "guests"> & { guests: string };

export const EMPTY_FORM: TahlilFormState = {
  contact_phone: "",
  event_name: "Tahlil 100 Hari",
  deceased_gender: "P",
  deceased_name: "",
  parent_name: "",
  guest_salutation: "Bapak/Saudara",
  date: "",
  time: "16:00",
  timezone: "WIB",
  time_note: "Ba’da Ashar",
  venue: "",
  host: "",
  no_gifts: true,
  guests: "",
};

/**
 * Starting values for a new form. In `next dev` it is prefilled with the
 * reference invitation's data for quick testing; production starts empty.
 */
export function initialForm(): TahlilFormState {
  if (process.env.NODE_ENV !== "development") return EMPTY_FORM;

  return {
    ...EMPTY_FORM,
    contact_phone: "0812 3456 7890",
    deceased_name: "Ibu Tarsem",
    parent_name: "Surma (Gandamisastra)",
    date: "2026-11-08",
    venue: "Rumah Almh. Ibu Tarsem\nDesa Tiwulandu RT 02/RW 01",
    host: "Bpk Kono - Ibu Tuti",
  };
}

export function formFromSubmission(submission: TahlilSubmission): TahlilFormState {
  return {
    contact_phone: submission.contact_phone,
    event_name: submission.event_name,
    deceased_gender: submission.deceased_gender,
    deceased_name: submission.deceased_name,
    parent_name: submission.parent_name ?? "",
    guest_salutation: submission.guest_salutation,
    date: submission.date,
    time: submission.time,
    timezone: submission.timezone,
    time_note: submission.time_note ?? "",
    venue: submission.venue,
    host: submission.host,
    no_gifts: submission.no_gifts,
    guests: submission.guests.join("\n"),
  };
}

export function parseGuests(raw: string): string[] {
  return raw
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function toSubmissionInput(form: TahlilFormState): TahlilSubmissionInput {
  return { ...form, guests: parseGuests(form.guests) };
}

export function toInvitationInput(form: TahlilFormState): TahlilInvitationInput {
  const { contact_phone, ...rest } = toSubmissionInput(form);
  void contact_phone; // not part of the PDF
  return rest;
}

/** Client-side checks mirroring server rules the browser can't enforce itself. */
export function validateForm(form: TahlilFormState, maxGuests: number): string | null {
  const venueLines = form.venue.split("\n").filter((line) => line.trim() !== "").length;
  if (venueLines > MAX_VENUE_LINES) return `Tempat maksimal ${MAX_VENUE_LINES} baris.`;
  if (parseGuests(form.guests).length > maxGuests) return `Maksimal ${maxGuests} nama tamu.`;
  return null;
}

/** "081234567890" → "6281234567890" for wa.me links. */
export function waNumber(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}
