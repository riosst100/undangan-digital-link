export type CustomerInvitation = {
  id: string;
  slug: string;
  status: "draft" | "published" | "unpublished";
  share_template: string | null;
  share_message: string | null;
  couple: {
    bride_name: string | null;
    bride_nickname: string | null;
    groom_name: string | null;
    groom_nickname: string | null;
  } | null;
};

export type Guest = {
  id: string;
  name: string;
  token: string;
  opened_at: string | null;
  created_at: string;
};
