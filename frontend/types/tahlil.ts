export type TahlilInvitationInput = {
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

export type TahlilSubmission = Omit<TahlilSubmissionInput, "parent_name" | "time_note"> & {
  id: string;
  status: TahlilStatus;
  parent_name: string | null;
  time_note: string | null;
  created_at: string;
  updated_at: string;
};
