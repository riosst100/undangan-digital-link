import type { SectionConfig, ThemeTokens } from "./template";

export type PublicInvitation = {
  slug: string;
  status: "draft" | "published" | "unpublished";
  sections: SectionConfig[];
  theme: ThemeTokens;
  content: {
    cover: {
      brideNickname: string;
      groomNickname: string;
      eventDate: string;
      coverPhotoUrl?: string;
      guestName?: string;
    };
    [key: string]: unknown;
  };
  seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
  };
};
