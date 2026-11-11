import type { InvitationType, KhitanKind, TahlilInvitationInput, TahlilSubmission, TahlilSubmissionInput } from "@/types/tahlil";

export const MAX_VENUE_LINES = 2;

export const INVITATION_TYPES: { value: InvitationType; label: string }[] = [
  { value: "tahlil", label: "Tahlil" },
  { value: "pernikahan", label: "Pernikahan" },
  { value: "khitan", label: "Khitan" },
];

export const KHITAN_KINDS: { value: KhitanKind; label: string }[] = [
  { value: "sinoman", label: "Undangan Sinoman" },
  { value: "sedekah", label: "Walimatul Khitan" },
];

/** Default event name and suggestions for a type (and khitan kind). */
export function eventOptions(type: InvitationType, kind: KhitanKind): { defaultName: string; suggestions: string[] } {
  if (type === "pernikahan") {
    return { defaultName: "Resepsi Pernikahan", suggestions: ["Resepsi Pernikahan", "Akad Nikah", "Walimatul Ursy"] };
  }
  if (type === "khitan") {
    return kind === "sinoman"
      ? { defaultName: "Kumpulan Sinoman Khitan", suggestions: ["Kumpulan Sinoman Khitan", "Kumpulan Sinoman"] }
      : { defaultName: "Walimatul Khitan", suggestions: ["Walimatul Khitan", "Syukuran Khitanan"] };
  }
  return {
    defaultName: "Tahlil 100 Hari",
    suggestions: ["Tahlil 3 Hari", "Tahlil 7 Hari", "Tahlil 40 Hari", "Tahlil 100 Hari", "Haul 1 Tahun", "Haul 2 Tahun", "Tahlil 1000 Hari"],
  };
}

const ALL_DEFAULT_NAMES = (["tahlil", "pernikahan", "khitan"] as const).flatMap((type) =>
  (["sinoman", "sedekah"] as const).map((kind) => eventOptions(type, kind).defaultName),
);

/** True while the event name is blank or still an untouched default. */
export function isDefaultEventName(name: string): boolean {
  return name === "" || ALL_DEFAULT_NAMES.includes(name);
}

/** Letter wording shown in the form; mirrors the backend defaults ({sapaan} = guest salutation). */
export const WORDING_FIELDS = [
  "opening_text",
  "subject_label",
  "closing_text",
  "salam_text",
  "signoff_text",
  "recipient_label",
  "schedule_intro",
  "no_gifts_text",
] as const;
export type WordingField = (typeof WORDING_FIELDS)[number];

export function wordingDefaults(type: InvitationType): Record<WordingField, string> {
  return {
    opening_text: `Dengan memohon Rahmat dan Ridho Allah SWT, kami memohon dengan hormat kehadiran {sapaan} untuk ${
      type === "tahlil" ? "memberikan do’a barokah pada acara" : "hadir pada acara"
    }`,
    subject_label: { tahlil: "wafatnya:", pernikahan: "pernikahan:", khitan: ":" }[type],
    closing_text:
      "Demikian undangan ini kami sampaikan, atas perhatian dan keikhlasan langkah {sapaan} untuk menghadiri undangan ini, kami ucapkan terima kasih.",
    salam_text: "Wassalamu’alaikum Wr.Wb",
    signoff_text: "Hormat Kami,",
    recipient_label: "Kepada Yth,",
    schedule_intro: "Yang akan dilaksanakan pada :",
    no_gifts_text: "TIDAK MENERIMA KONDANGAN",
  };
}

/** Wording of the new type: fields still holding any type's default follow the type; edited ones stay. */
export function wordingForType(form: TahlilFormState, type: InvitationType): Partial<Record<WordingField, string>> {
  const next = wordingDefaults(type);
  const changes: Partial<Record<WordingField, string>> = {};
  for (const field of WORDING_FIELDS) {
    const isDefault =
      form[field].trim() === "" ||
      (["tahlil", "pernikahan", "khitan"] as const).some((t) => wordingDefaults(t)[field] === form[field]);
    if (isDefault) changes[field] = next[field];
  }
  return changes;
}

/** Short description of who the invitation is about, for lists and messages. */
export function subjectLabel(input: {
  type: InvitationType | "";
  deceased_gender: "L" | "P" | null;
  deceased_name: string | null;
  groom_name: string | null;
  bride_name: string | null;
  child_name: string | null;
}): string {
  if (input.type === "pernikahan") return `${input.groom_name ?? ""} & ${input.bride_name ?? ""}`;
  if (input.type === "khitan") return input.child_name ?? "";
  return `${input.deceased_gender === "P" ? "Almh." : "Alm."} ${input.deceased_name ?? ""}`;
}

/** Mirrors the backend caps: public submissions vs. the admin tool. */
export const MAX_GUESTS = { public: 50, admin: 200 } as const;

/** Form-friendly shape: guests edited as one name per line. */
/** `type` is empty until the user picks one; the rest of the form only shows after that. */
export type TahlilFormState = Omit<TahlilSubmissionInput, "guests" | "type"> & { guests: string; type: InvitationType | "" };

export const EMPTY_FORM: TahlilFormState = {
  contact_phone: "",
  type: "",
  illustration: "",
  ...wordingDefaults("tahlil"),
  khitan_kind: "sinoman",
  groom_name: "",
  bride_name: "",
  child_name: "",
  title: "UNDANGAN",
  event_name: "",
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
    type: "tahlil",
    event_name: "Tahlil 100 Hari",
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
    contact_phone: submission.contact_phone ?? "",
    type: submission.type,
    illustration: submission.illustration ?? "",
    opening_text: submission.opening_text ?? wordingDefaults(submission.type).opening_text,
    subject_label: submission.subject_label ?? wordingDefaults(submission.type).subject_label,
    closing_text: submission.closing_text ?? wordingDefaults(submission.type).closing_text,
    salam_text: submission.salam_text ?? wordingDefaults(submission.type).salam_text,
    signoff_text: submission.signoff_text ?? wordingDefaults(submission.type).signoff_text,
    recipient_label: submission.recipient_label ?? wordingDefaults(submission.type).recipient_label,
    schedule_intro: submission.schedule_intro ?? wordingDefaults(submission.type).schedule_intro,
    no_gifts_text: submission.no_gifts_text ?? wordingDefaults(submission.type).no_gifts_text,
    khitan_kind: submission.khitan_kind ?? "sinoman",
    groom_name: submission.groom_name ?? "",
    bride_name: submission.bride_name ?? "",
    child_name: submission.child_name ?? "",
    title: submission.title,
    event_name: submission.event_name,
    deceased_gender: submission.deceased_gender ?? "P",
    deceased_name: submission.deceased_name ?? "",
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
  return { ...form, type: form.type as InvitationType, guests: parseGuests(form.guests) };
}

export function toInvitationInput(form: TahlilFormState): TahlilInvitationInput {
  const { contact_phone, ...rest } = toSubmissionInput(form);
  void contact_phone; // not part of the PDF
  return rest;
}

/** Client-side checks mirroring server rules the browser can't enforce itself. */
export function validateForm(form: TahlilFormState, maxGuests: number): string | null {
  if (!form.type) return "Pilih jenis undangan.";
  const venueLines = form.venue.split("\n").filter((line) => line.trim() !== "").length;
  if (venueLines > MAX_VENUE_LINES) return `Tempat maksimal ${MAX_VENUE_LINES} baris.`;
  if (parseGuests(form.guests).length > maxGuests) return `Maksimal ${maxGuests} nama tamu.`;
  return null;
}

/** Required fields filled in, so the data can be stored and rendered. */
export function isComplete(form: TahlilFormState): boolean {
  const filled = (value: string) => value.trim() !== "";
  const subject =
    form.type === "pernikahan"
      ? filled(form.groom_name) && filled(form.bride_name)
      : form.type === "khitan"
        ? filled(form.child_name)
        : filled(form.deceased_name);
  return form.type !== "" && subject && [form.title, form.event_name, form.guest_salutation, form.date, form.time, form.venue, form.host].every(filled);
}

/** "081234567890" → "6281234567890" for wa.me links. */
export function waNumber(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}
