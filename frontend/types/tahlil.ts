export type InvitationType = "tahlil" | "pernikahan" | "khitan";
export type KhitanKind = "sinoman" | "sedekah";

export type TahlilInvitationInput = {
  type: InvitationType;
  /** Optional cover illustration as a data URL; empty when none. */
  illustration: string;
  opening_text: string;
  subject_label: string;
  closing_text: string;
  salam_text: string;
  signoff_text: string;
  recipient_label: string;
  schedule_intro: string;
  no_gifts_text: string;
  khitan_kind: KhitanKind;
  groom_name: string;
  bride_name: string;
  child_name: string;
  title: string;
  event_name: string;
  deceased_gender: "L" | "P";
  deceased_name: string;
  parent_name: string;
  guest_salutation: string;
  date: string;
  time: string;
  timezone: "WIB" | "WITA" | "WIT";
  time_note: string;
  venue: string;
  host: string;
  no_gifts: boolean;
  guests: string[];
};

export type TahlilStatus = "baru" | "diproses" | "selesai";

export type TahlilSubmissionInput = TahlilInvitationInput & { contact_phone: string };

export type TahlilSubmission = Omit<TahlilSubmissionInput, "contact_phone" | "parent_name" | "time_note" | "illustration" | "opening_text" | "subject_label" | "closing_text" | "salam_text" | "signoff_text" | "recipient_label" | "schedule_intro" | "no_gifts_text" | "deceased_gender" | "deceased_name" | "khitan_kind" | "groom_name" | "bride_name" | "child_name"> & {
  id: string;
  status: TahlilStatus;
  opening_text: string | null;
  subject_label: string | null;
  closing_text: string | null;
  salam_text: string | null;
  signoff_text: string | null;
  recipient_label: string | null;
  schedule_intro: string | null;
  no_gifts_text: string | null;
  contact_phone: string | null;
  illustration: string | null;
  khitan_kind: KhitanKind | null;
  groom_name: string | null;
  bride_name: string | null;
  child_name: string | null;
  deceased_gender: "L" | "P" | null;
  deceased_name: string | null;
  parent_name: string | null;
  time_note: string | null;
  created_at: string;
  updated_at: string;
};
