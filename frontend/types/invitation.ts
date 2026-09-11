import type { SectionConfig, ThemeTokens } from "./template";
import type {
  CoupleContent,
  EventContent,
  StoryContent,
  GalleryContent,
  RsvpContent,
  GiftContent,
  QuoteContent,
  GuestGreetingContent,
  ClosingContent,
} from "@/lib/template-engine/registry";

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
    couple?: CoupleContent;
    event?: EventContent;
    story?: StoryContent;
    gallery?: GalleryContent;
    rsvp?: RsvpContent;
    gift?: GiftContent;
    quote?: QuoteContent;
    guest_greeting?: GuestGreetingContent;
    closing?: ClosingContent;
    [key: string]: unknown;
  };
  seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
  };
};
